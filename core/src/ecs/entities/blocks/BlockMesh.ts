import {
  Block, BlockColors, BlockDimensions, blocks, BlockShader, BlockTypeString,
  Entity, logPerf, mouse, Position, Renderable, XY, XYtoChunk
} from "@piggo-gg/core"
import { Buffer, BufferUsage, Geometry, Mesh } from "pixi.js"

const { width, height } = BlockDimensions

export const BlockMesh = (type: "foreground" | "background") => {
  const geometry = BLOCK_GEOMETRY()
  const shader = BlockShader()

  const zIndex = type === "foreground" ? 3.1 : 0

  let chunkData: Block[] = []
  let topBlocks: Block[] = [{ x: 9, y: 9, z: 1, type: 2 }]

  let flipped = 1

  return Entity({
    id: `block-mesh-${type}`,
    components: {
      position: Position(),
      renderable: Renderable({
        zIndex,
        anchor: { x: 0.5, y: 0.5 },
        interpolate: true,
        setup: async (r) => {
          r.c = new Mesh({ geometry, shader })
        },
        onTick: ({ world }) => {
          const { position } = world.client!.playerCharacter()?.components ?? {}
          if (!position) return

          const playerChunk = XYtoChunk(position.data)

          const renderDistance = 10

          const chunks: XY[] = []

          for (let x = -renderDistance; x <= renderDistance; x++) {
            for (let y = -renderDistance; y <= renderDistance; y++) {
              chunks.push({ x: playerChunk.x + x, y: playerChunk.y + y })
            }
          }

          if (world.flipped() !== flipped) {
            flipped = world.flipped()
            blocks.invalidate()
          }

          chunkData = blocks.data(chunks, flipped === -1)
        },
        onRender: ({ world, delta, renderable }) => {
          const time = performance.now()

          const zoom = world.renderer!.camera.scale
          const offset = world.renderer!.camera.focus?.components.renderable.c.position ?? { x: 0, y: 0, z: 0 }
          const resolution = world.renderer!.wh()

          const character = world.client?.playerCharacter()

          // character position
          const pcPos = character?.components.position.interpolate(delta, world) ?? { x: 0, y: 0, z: 0 }
          const pcPosFlip = world.flip(pcPos)

          // highlighted face
          let uHighlight = { block: { x: 0, y: 0, z: 0 }, face: 0 }
          if (character) uHighlight = blocks.atMouse(mouse, character.components.position.data) ?? { block: { x: 0, y: 0, z: 0 }, face: 0 }

          if (shader.resources.uniforms?.uniforms?.uZoom) {
            shader.resources.uniforms.uniforms.uZoom = zoom
            shader.resources.uniforms.uniforms.uCamera = [offset.x, offset.y]
            shader.resources.uniforms.uniforms.uPlayer = [pcPosFlip.x, pcPosFlip.y + 2, pcPos.z]
            shader.resources.uniforms.uniforms.uResolution = resolution
            shader.resources.uniforms.uniforms.uTime = performance.now() / 1000
            shader.resources.uniforms.uniforms.uHighlight = [uHighlight.block.x, uHighlight.block.y, uHighlight.block.z, uHighlight.face]

            // shadows
            // const pos = intToXYZ(topBlocks[0].x, topBlocks[0].y, topBlocks[0].z)
            // shader.resources.uniforms.uniforms.uTopBlocks = [pos.x, pos.y, pos.z + 10.5]
          }

          const { position } = character?.components ?? {}
          if (!position) return

          const playerZ = position.data.z - 20
          const playerY = world.flip(position.data).y

          const newPosBuffer = new Float32Array(chunkData.length * 3)
          const newColorBuffer = new Float32Array(chunkData.length * 3)

          let instanceCount = 0

          for (const block of chunkData) {
            const { x, y } = world.flip(block)

            const blockInFront = (y - playerY) > 0

            if (type === "foreground") {
              if (blockInFront && block.z >= playerZ) {
                newPosBuffer.set([x, y, block.z], instanceCount * 3)
                newColorBuffer.set(BlockColors[BlockTypeString[block.type]], instanceCount * 3)
                instanceCount += 1
              }
            } else if (!blockInFront || block.z < playerZ) {
              newPosBuffer.set([x, y, block.z], instanceCount * 3)
              newColorBuffer.set(BlockColors[BlockTypeString[block.type]], instanceCount * 3)
              instanceCount += 1
            }
          }

          geometry.attributes.aInstancePos.buffer.data = newPosBuffer
          geometry.attributes.aInstanceColor.buffer.data = newColorBuffer
          geometry.instanceCount = instanceCount

          renderable.c.visible = instanceCount > 0
          logPerf("block mesh", time, 9)
        }
      })
    }
  })
}

const W = 18
const V = 9

const BLOCK_GEOMETRY = () => new Geometry({
  instanceCount: 0,
  indexBuffer: [
    0, 1, 2,
    0, 2, 3,

    4, 5, 7,
    5, 6, 7,

    8, 9, 11,
    9, 11, 10,
  ],
  attributes: {
    aInstancePos: {
      instance: true,
      buffer: new Buffer({
        data: [],
        usage: BufferUsage.VERTEX | BufferUsage.COPY_DST,
      })
    },
    aInstanceColor: {
      instance: true,
      buffer: new Buffer({
        data: [],
        usage: BufferUsage.VERTEX | BufferUsage.COPY_DST,
      })
    },
    aFace: [
      0, 0, 0, 0, // top
      1, 1, 1, 1, // left
      2, 2, 2, 2  // right
    ],
    aOffset: [
      0, V, 21,
      -W, 0, 21,
      0, -V, 21,
      W, 0, 21,

      0, V, 21,
      -W, 0, 21,
      -W, 0, 0,
      0, V, 0,

      0, V, 21,
      W, 0, 21,
      W, 0, 0,
      0, V, 0
    ],
    aPosition: [
      0, 0,
      -width, -width / 2,
      0, -width,
      width, -width / 2,

      0, 0,
      -width, -width / 2,
      -width, height,
      0, height + width / 2,

      0, 0,
      width, -width / 2,
      width, height,
      0, height + width / 2,
    ],
    aBary: [
      1, 0, 0,
      0, 1, 0,
      0, 0, 1,
      0, 1, 0,


      1, 0, 0,
      0, 1, 0,
      1, 0, 0,
      0, 0, 1,


      1, 1, 1,
      1, 1, 1,
      1, 1, 1,
      1, 1, 1
    ]
  }
})
