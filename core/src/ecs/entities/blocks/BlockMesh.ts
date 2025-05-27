import {
  Block, BlockColors, BlockDimensions, blocks, BlockShader, BlockTypeString,
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
        const after = targets[i - 1]

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
          if (i === 1) {
            newColorBuffer.set(BlockColors["saphire"], j * 3)
          }

          if (i === 2) {
            // newColorBuffer.set(BlockColors["wood"], j * 3)
          }
        }

        geometry.attributes.aInstancePos.buffer.data = newPosBuffer
        geometry.attributes.aInstanceColor.buffer.data = newColorBuffer
        geometry.instanceCount = layer.length

        renderable.c.renderable = layer.length > 0
        renderable.visible = layer.length > 0

        if (after && layer.length > 0) {
          renderable.c.zIndex = round(after.zIndex + 0.00001, 5)
        }

        // console.log(`child ${i} zIndex: ${renderable.c.zIndex} targets: ${targets.length}`)
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
        setChildren: async () => [MeshChild(0), MeshChild(1), MeshChild(2)],
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
            blocks.invalidate("visibleCache")
          }

          chunkData = blocks.visible(chunks, flipped === -1)
        },
        onRender: ({ world, delta, renderable }) => {
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
          }

          // console.log(layers.map(x => x.length))
          console.log(renderable.children?.map(x => x.c.zIndex))

          targets = []

          if (character) targets[0] = {
            x: pcPosFlip.x, y: pcPosFlip.y, z: pcPos.z - 20,
            zIndex: character.components.renderable.c.zIndex,
            id: character.id
          }

          // const entities = world.queryEntities<Position>(["position", "renderable"])
          const entities = world.queryEntities<Position | Renderable | Item>(["position", "renderable", "item"])

          let i = 1
          for (const entity of entities) {
            if (entity.components.position.screenFixed) continue
            if (!entity.components.item.dropped) continue

            targets[i] = {
              x: entity.components.position.data.x,
              y: entity.components.position.data.y,
              z: entity.components.position.data.z,
              zIndex: entity.components.renderable.c.zIndex,
              id: entity.id
            }
            i += 1
          }
          targets.sort((a, b) => (a.y - b.y))
          // logRare(stringify(targets.map(x => x.id)), world)

          layers = []

          // divvy up the blocks for each mesh child
          for (const block of chunkData) {
            // const { y: blockY } = world.flip(block)

            for (let i = 0; i <= targets.length; i++) {
              const target = targets[i]

              if (!layers[i]) layers[i] = []

              if (i === targets.length) {
                layers[i].push(block)
                break
              }

              // behind the next target
              // if (((target.y - block.y) > 0) || (block.z < target.z)) {
              // if ((target.y - block.y) > 9) {
              if (((target.y - block.y) > -9) && (block.z < target.z)) {
                layers[i].push(block)
                break
                // console.log("push behind")
              }

              // or
              if (((target.y - block.y) > 0)) {
                layers[i].push(block)
                break
              }
            }
          }
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
