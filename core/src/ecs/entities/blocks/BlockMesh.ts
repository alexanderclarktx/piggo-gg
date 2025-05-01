import {
  Block, BlockColors, BlockDimensions, blocks, BlockShader,
  BlockTypeString, Entity, Position, Renderable, XY, XYtoChunk
} from "@piggo-gg/core"
import { Buffer, BufferUsage, Geometry, Mesh } from "pixi.js"

const { width, height } = BlockDimensions

export const BlockMesh = (type: "foreground" | "background") => {
  const geometry = BLOCK_GEOMETRY()
  const shader = BlockShader()

  const zIndex = type === "foreground" ? 3.1 : 0

  let chunkData: Block[] = []

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

          const renderDistance = 6

          const chunks: XY[] = []

          for (let x = -renderDistance; x <= renderDistance; x++) {
            for (let y = -renderDistance; y <= renderDistance; y++) {
              chunks.push({ x: playerChunk.x + x, y: playerChunk.y + y })
            }
          }

          chunkData = blocks.data(chunks)
        },
        onRender: ({ world, delta, renderable }) => {
          const time = performance.now()

          const zoom = world.renderer!.camera.scale
          const offset = world.renderer!.camera.focus?.components.renderable.c.position ?? { x: 0, y: 0, z: 0 }
          const resolution = world.renderer!.wh()

          const pcPos = world.client!.playerCharacter()?.components.position.interpolate(delta, world) ?? { x: 0, y: 0, z: 0 }
          const pcPosFlip = world.flip(pcPos)
          const pcXYZ = [pcPosFlip.x, pcPosFlip.y + 2, pcPos.z]

          if (shader.resources.uniforms?.uniforms?.uZoom) {
            shader.resources.uniforms.uniforms.uZoom = zoom
            shader.resources.uniforms.uniforms.uCamera = [offset.x, offset.y]
            shader.resources.uniforms.uniforms.uPlayer = pcXYZ
            shader.resources.uniforms.uniforms.uResolution = resolution
            shader.resources.uniforms.uniforms.uTime = performance.now() / 1000
          }

          const { position } = world.client!.playerCharacter()?.components ?? {}
          if (!position) return

          const playerZ = position.data.z - 20
          const playerY = world.flip(position.data).y

          const newPosBuffer: number[] = []
          const newColorBuffer: number[] = []

          let instanceCount = 0
          for (const block of chunkData) {
            // const { x, y } = world.flip(block)
            const { x, y } = block

            const blockInFront = (y - playerY) > 0

            if (type === "foreground") {
              if (blockInFront && block.z >= playerZ) {
                instanceCount += 1
                newPosBuffer.push(x, y, block.z)
                newColorBuffer.push(...BlockColors[BlockTypeString[block.type]])
                // newColorBuffer.push(...BlockColors["saphire"])
              }
            } else if (!blockInFront || block.z < playerZ) {
              instanceCount += 1

              newPosBuffer.push(x, y, block.z)
              newColorBuffer.push(...BlockColors[BlockTypeString[block.type]])
            }
          }

          geometry.attributes.aInstancePos.buffer.data = new Float32Array(newPosBuffer)
          geometry.attributes.aInstanceColor.buffer.data = new Float32Array(newColorBuffer)
          geometry.instanceCount = instanceCount

          renderable.c.visible = instanceCount > 0

          console.log("block mesh", performance.now() - time)
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
    5, 7, 6,

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
    ]
  }
})
