import {
  BlockColors, BlockDimensions, blocks, BlockShader,
  BlockTypeString, Entity, Position, Renderable
} from "@piggo-gg/core"
import { Buffer, BufferUsage, Geometry, Mesh } from "pixi.js"

const { width, height } = BlockDimensions

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
    aUV: [
      0, 0.82, 0.0,
      0.0, 0.82, 0.0,
      0.0, 0.82, 0.0,
      0.0, 0.82, 0.0,

      0.5, 0.2, 0.0,
      0.5, 0.2, 0.0,
      0.5, 0.2, 0.0,
      0.5, 0.2, 0.0,

      0.6, 0.3, 0.0,
      0.6, 0.3, 0.0,
      0.6, 0.3, 0.0,
      0.6, 0.3, 0.0,
    ],
    aOffset: [
      0, width, width,
      -width, 0, width,
      0, -width, width,
      width, 0, width,

      0, width, width,
      -width, 0, width,
      -width, 0, -width,
      0, width, -width,

      0, width, width,
      width, 0, width,
      width, 0, -width,
      0, width, -width
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

export const BlockMesh = () => {

  const geometry = BLOCK_GEOMETRY()

  const shader = BlockShader()

  return Entity({
    id: "block-mesh",
    components: {
      position: Position(),
      renderable: Renderable({
        zIndex: 0,
        anchor: { x: 0.5, y: 0.5 },
        interpolate: true,
        setup: async (r) => {
          const mesh = new Mesh({ geometry, shader })

          r.c = mesh
        },
        onRender: ({ world }) => {
          const time = performance.now()
          const zoom = world.renderer!.camera.scale
          const offset = world.renderer!.camera.focus?.components.renderable.c.position ?? { x: 0, y: 0, z: 0 }
          const resolution = world.renderer!.wh()

          if (shader.resources.uniforms?.uniforms?.uZoom) {
            shader.resources.uniforms.uniforms.uZoom = zoom
            shader.resources.uniforms.uniforms.uCamera = [offset.x, offset.y]
            shader.resources.uniforms.uniforms.uResolution = resolution
          }

          const { position } = world.client!.playerCharacter()?.components ?? {}
          if (!position) return

          const playerZ = position.data.z - 20
          const playerY = world.flip(position.data).y

          blocks.sort(world)
          const { data } = blocks

          const newPosBuffer: number[] = []
          const newColorBuffer: number[] = []

          let instanceCount = 0
          for (const block of data) {
            const { x, y } = world.flip(block)

            // if (abs(offset.x - x) > 300) continue
            // if (abs(offset.y - y) > 300) continue

            const blockInFront = (y - playerY) > 0
            if (!blockInFront || block.z < playerZ) {
              instanceCount += 1

              newPosBuffer.push(x, y, block.z)
              newColorBuffer.push(...BlockColors[BlockTypeString[block.type]])
            }
          }

          geometry.attributes.aInstancePos.buffer.data = new Float32Array(newPosBuffer)
          geometry.attributes.aInstanceColor.buffer.data = new Float32Array(newColorBuffer)
          geometry.instanceCount = instanceCount

          // console.log("block mesh", performance.now() - time)
        }
      })
    }
  })
}

export const BlockMeshOcclusion = () => {

  const geometry = BLOCK_GEOMETRY()

  const shader = BlockShader()

  return Entity({
    id: "block-mesh-occlusion",
    components: {
      position: Position(),
      renderable: Renderable({
        zIndex: 3.1,
        anchor: { x: 0.5, y: 0.5 },
        interpolate: true,
        setup: async (r) => {
          const mesh = new Mesh({ geometry, shader })

          r.c = mesh
        },
        onRender: ({ world, renderable }) => {
          const zoom = world.renderer!.camera.scale
          const offset = world.renderer!.camera.focus?.components.renderable.c.position ?? { x: 0, y: 0, z: 0 }
          const resolution = world.renderer!.wh()

          if (shader.resources.uniforms?.uniforms?.uZoom) {
            shader.resources.uniforms.uniforms.uZoom = zoom
            shader.resources.uniforms.uniforms.uCamera = [offset.x, offset.y]
            shader.resources.uniforms.uniforms.uResolution = resolution
          }

          const { position } = world.client!.playerCharacter()?.components ?? {}
          if (!position) return

          const playerZ = position.data.z - 20
          const playerY = world.flip(position.data).y

          blocks.sort(world)
          const { data } = blocks

          const newPosBuffer: number[] = []
          const newColorBuffer: number[] = []

          let instanceCount = 0
          for (const block of data) {
            const { x, y } = world.flip(block)

            // if (abs(offset.x - x) > 300) continue
            // if (abs(offset.y - y) > 300) continue

            const blockInFront = (y - playerY) > 0
            if (blockInFront && block.z >= playerZ) {
              instanceCount += 1

              newPosBuffer.push(x, y, block.z)
              newColorBuffer.push(...BlockColors[BlockTypeString[block.type]])
            }
          }

          geometry.attributes.aInstancePos.buffer.data = new Float32Array(newPosBuffer)
          geometry.attributes.aInstanceColor.buffer.data = new Float32Array(newColorBuffer)
          geometry.instanceCount = instanceCount

          renderable.c.visible = instanceCount > 0
        }
      })
    }
  })
}
