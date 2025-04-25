import {
  BlockColors,
  BlockDimensions, blocks, BlockShader, BlockTypeString, Collider, Entity, floor, mouse,
  pixiGraphics, Position, Renderable, round, World, XY, XYZ
} from "@piggo-gg/core"
import { Buffer, BufferUsage, Geometry, Mesh } from "pixi.js"

const { width, height } = BlockDimensions

export const BlockCollider = (n: number) => Entity<Position | Collider>({
  id: `terrain-collider-${n}`,
  components: {
    position: Position(),
    collider: Collider({
      cullable: true,
      group: "1",
      hittable: true,
      isStatic: true,
      shape: "line",
      points: [
        0, width / 2,
        -width, 0,
        0, 3 - height,
        width, 0,
        0, width / 2
      ]
    })
  }
})

// takes ij integer coordinates -> XY of that block from origin
export const intToBlock = (i: number, j: number): XY => ({
  x: (i - j) * width,
  y: (i + j) * width / 2
})

const xyBlock = (pos: XY): XY => {
  const half = width / 2
  const gridX = (pos.x / width + pos.y / half) / 2
  const gridY = (pos.y / half - pos.x / width) / 2
  const tileX = round(gridX)
  const tileY = round(gridY)
  return { x: tileX, y: tileY }
}

export const snapXYToChunk = (pos: XY): XY => {
  const snapped = xyBlock(pos)
  const x = floor(snapped.x / 4)
  const y = floor(snapped.y / 4)
  return { x, y }
}

// block[] at some X
type XBlocks = Record<number, Entity<Position>[]>

// todo move to an entity
const xBlocksBuffer: XBlocks = {}

const buildXBlocksBuffer = (world: World): XBlocks => {
  const blocks = world.queryEntities<Position>(["position"], x => x.id.startsWith("block-"))

  for (const block of blocks) {
    const { x } = block.components.position.data
    if (!xBlocksBuffer[x]) {
      xBlocksBuffer[x] = []
    }
    xBlocksBuffer[x].push(block)
  }

  return xBlocksBuffer
}

const addToXBlocksBuffer = (block: Entity<Position>) => {
  const { x } = block.components.position.data
  if (!xBlocksBuffer[x]) {
    xBlocksBuffer[x] = []
  }
  xBlocksBuffer[x].push(block)
}

// use the xBlocksBuffer to find the block at the mouse position
const blockAtMouse = (mouse: XY): XYZ | null => {
  const snapped = snapXY(mouse)

  // sort by Z desc then Y desc
  const blocks = xBlocksBuffer[snapped.x]
  if (!blocks) return null

  // sort by Z desc
  blocks.sort((a, b) => {
    const zA = a.components.position.data.z
    const zB = b.components.position.data.z
    return zB - zA
  })

  // sort by Y asc
  blocks.sort((a, b) => {
    const yA = a.components.position.data.y
    const yB = b.components.position.data.y
    return yB - yA
  })

  for (const block of blocks) {
    const { x, y, z } = block.components.position.data

    const bottom = y - z
    const top = bottom - height - width

    if (mouse.y <= bottom && mouse.y >= top) {
      return { x, y, z }
    }
  }

  return null
}

export const BlockPreview = () => Entity({
  id: "item-block-preview",
  components: {
    position: Position(),
    renderable: Renderable({
      zIndex: 3,
      anchor: { x: 0.5, y: 0 },
      position: { x: 0, y: 0 },
      onTick: ({ entity, world }) => {
        let visible = false

        const activeItem = world.client?.playerCharacter()?.components.inventory?.activeItem(world)
        if (activeItem && activeItem.id.startsWith("item-block-")) {
          visible = true
        }
        entity.components.renderable.visible = visible

        if (!visible) return

        // if (keys(xBlocksBuffer).length === 0) {
        //   buildXBlocksBuffer(world)
        // }

        const xyz = snapXYZ(world.flip(mouse))
        // const xyz = blockAtMouse(mouse)

        if (!xyz) {
          entity.components.renderable.visible = false
        } else {
          entity.components.renderable.visible = true
          entity.components.position.setPosition(xyz)
        }
      },
      setup: async (r) => {
        const g = pixiGraphics()
          // top
          .moveTo(0, 0)
          .lineTo(-width, -width / 2)
          .lineTo(0, -width)
          .lineTo(width, -width / 2)
          .lineTo(0, 0)

          // bottom-left
          .moveTo(-width, -width / 2)
          .lineTo(-width, height)
          .lineTo(0, height + width / 2)
          .lineTo(0, 0)

          // bottom-right
          .lineTo(0, height + width / 2)
          .lineTo(width, height)
          .lineTo(width, -width / 2)
          .stroke()

        g.position.y = -height

        r.c.addChild(g)

        r.setGlow({ outerStrength: 1 })
      }
    })
  }
})

// -----------------------------

export const snapXY = (pos: XY): XY => {
  const half = width / 2

  // Convert to isometric grid coords (skewed grid space)
  const gridX = (pos.x / width + pos.y / half) / 2
  const gridY = (pos.y / half - pos.x / width) / 2

  // Snap to nearest tile
  const tileX = round(gridX)
  const tileY = round(gridY)

  // Convert back to screen position (center of tile)
  const snappedX = (tileX - tileY) * width
  const snappedY = (tileX + tileY) * half

  return { x: snappedX, y: snappedY }
}

export const snapXYZ = (pos: XY): XYZ => {
  return { z: highestBlock(pos).z, ...snapXY(pos) }
}

export const highestBlock = (pos: XY): XYZ => {
  const snapped = snapXY(pos)

  let level = 0

  // todo this is slow, should be a spatial hash ?
  for (const block of blocks.data) {
    const { x, y, z } = block
    if (x === snapped.x && y === snapped.y) {
      level = Math.max(level, z + 21)
    }
  }

  return { x: snapped.x, y: snapped.y, z: level }
}

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

            // if (abs(offset.x - x) > 200) continue
            // if (abs(offset.y - y) > 200) continue

            const blockInFront = (y - playerY) > 0
            if (!blockInFront || block.z < playerZ) {
              instanceCount += 1

              newPosBuffer.push(x, y - block.z)
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

            // if (abs(offset.x - x) > 200) continue
            // if (abs(offset.y - y) > 200) continue

            const blockInFront = (y - playerY) > 0
            if (blockInFront && block.z >= playerZ) {
              instanceCount += 1

              newPosBuffer.push(x, y - block.z)
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
