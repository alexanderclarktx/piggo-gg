import {
  Block, BlockColors, BlockDimensions, BlockShader, BlockTypeString,
  Entity, Item, mouse, Position, Renderable, round, XY, XYtoChunk, XYZ
} from "@piggo-gg/core"
import { Buffer, BufferUsage, Geometry, Mesh } from "pixi.js"

const { width, height } = BlockDimensions

export const BlockMesh = () => {
  const shader = BlockShader()

  let layers: Block[][] = []
  let targets: (XYZ & { zIndex: number, id: string })[] = []
  let chunkData: Block[] = []
  let flipped = 1

  const MeshChild = (i: number) => {

    const geometry = BLOCK_GEOMETRY()

    return Renderable({
      zIndex: 0,
      anchor: { x: 0.5, y: 0.5 },
      obedient: false,
      setup: async (r) => {
        r.c = new Mesh({ geometry, shader, interactive: false, cullable: false, isRenderGroup: true })
      },
      onRender: ({ world, renderable }) => {
        const layer = layers[i]
        if (!layer) {
          renderable.c.renderable = false
          return
        }

        const newPosBuffer = new Float32Array(layer.length * 3)
        const newColorBuffer = new Float32Array(layer.length * 3)

        for (let j = 0; j < layer.length; j++) {
          const block = layer[j]
          const { x: blockX, y: blockY } = world.flip(block)

          newPosBuffer.set([blockX, blockY, block.z], j * 3)
          newColorBuffer.set(BlockColors[BlockTypeString[block.type]], j * 3)

          // newColorBuffer.set(BlockColors[BlockTypeString[i]], j * 3)
        }

        geometry.attributes.aInstancePos.buffer.data = newPosBuffer
        geometry.attributes.aInstanceColor.buffer.data = newColorBuffer
        geometry.instanceCount = layer.length

        renderable.c.renderable = true

        const after = targets[i - 1]
        if (after && layer.length > 0) {
          renderable.c.zIndex = round(after.zIndex + 0.00001, 5)
        }
      }
    })
  }

  return Entity({
    id: `block-mesh`,
    components: {
      position: Position(),
      renderable: Renderable({
        zIndex: 0,
        anchor: { x: 0.5, y: 0.5 },
        setChildren: async () => Array.from({ length: 32 }, (_, i) => MeshChild(i)),
        onTick: ({ world }) => {
          const { position } = world.client!.playerCharacter()?.components ?? {}
          if (!position) return

          const playerChunk = XYtoChunk(position.data)

          const renderDistance = 12

          const chunks: XY[] = []

          for (let x = -renderDistance; x <= renderDistance; x++) {
            for (let y = -renderDistance; y <= renderDistance; y++) {
              chunks.push({ x: playerChunk.x + x, y: playerChunk.y + y })
            }
          }

          if (world.flipped() !== flipped) {
            flipped = world.flipped()
            world.blocks.invalidate("visibleCache")
          }

          chunkData = world.blocks.visible(chunks, flipped === -1)
        },
        onRender: ({ world, delta }) => {
          const zoom = world.renderer!.camera.scale
          const offset = world.renderer!.camera.focus?.components.renderable?.c.position ?? { x: 0, y: 0, z: 0 }
          const resolution = world.renderer!.wh()

          const character = world.client?.playerCharacter()

          // character position
          const pcPos = character?.components.position.interpolate(world, delta) ?? { x: 0, y: 0, z: 0 }
          const pcPosFlip = world.flip(pcPos)

          // highlighted face
          let uHighlight = { block: { x: 0, y: 0, z: 0 }, face: 0 }
          if (character) uHighlight = world.blocks.atMouse(mouse, character.components.position.data) ?? { block: { x: 0, y: 0, z: 0 }, face: 0 }

          if (shader.resources.uniforms?.uniforms?.uZoom) {
            shader.resources.uniforms.uniforms.uZoom = zoom
            shader.resources.uniforms.uniforms.uCamera = [offset.x, offset.y]
            shader.resources.uniforms.uniforms.uPlayer = [pcPosFlip.x, pcPosFlip.y + 2, pcPos.z]
            shader.resources.uniforms.uniforms.uResolution = resolution
            shader.resources.uniforms.uniforms.uTime = performance.now() / 1000
            shader.resources.uniforms.uniforms.uHighlight = [uHighlight.block.x, uHighlight.block.y, uHighlight.block.z, uHighlight.face]
          }

          // console.log(`${renderable.children?.[1].c.zIndex} | ${renderable.children?.[2].c.zIndex}`)

          // reset state
          targets = []
          layers = []

          if (character) targets[0] = {
            x: pcPosFlip.x, y: pcPosFlip.y, z: pcPos.z - 20,
            zIndex: character.components.renderable?.c.zIndex ?? 4,
            id: character.id
          }

          // const entities = world.queryEntities<Position>(["position", "renderable"])
          const entities = world.queryEntities<Position | Renderable | Item>(["position", "renderable", "item"])

          let i = 1
          for (const entity of entities) {
            if (entity.components.position.screenFixed) continue
            if (!entity.components.item.dropped) continue
            if (!entity.components.renderable.rendered) continue
            if (entity.components.renderable.c.zIndex === 4) continue

            targets[i] = {
              x: entity.components.position.data.x,
              y: entity.components.position.data.y,
              z: entity.components.position.data.z - 20,
              zIndex: entity.components.renderable.c.zIndex,
              id: entity.id
            }
            i += 1
          }
          targets.sort((a, b) => (a.zIndex - b.zIndex))

          // console.log(`targets: ${targets.map(t => `${t.id} ${t.zIndex}`).join(" | ")}`)

          // divvy up the blocks for each mesh child
          for (const block of chunkData) {
            const { y: blockY } = world.flip(block)

            for (let i = 0; i <= targets.length; i++) {
              const target = targets[i]

              if (!layers[i]) layers[i] = []

              if (i === targets.length) {
                layers[i].push(block)
                break
              }

              // behind the next target
              if (((target.y - blockY) > -12) && (block.z < target.z)) {
                layers[i].push(block)
                break
              }

              if (((target.y - blockY) > 0)) {
                layers[i].push(block)
                break
              }
            }
          }

          // console.log(`${targets[0]?.id} ${targets[0]?.zIndex} | ${targets[1]?.id} ${targets[1]?.zIndex}`)
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
