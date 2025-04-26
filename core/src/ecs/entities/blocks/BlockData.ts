import { BlockDimensions, Entity, floor, round, Voxel, World, XY, XYZ, Position } from "@piggo-gg/core"

const { width, height } = BlockDimensions

export type BlockData = {
  data: Voxel[]
  add: (block: Voxel) => void
  remove: (block: Voxel) => void
  sort: (world: World) => Voxel[]
}

export const BlockData = (): BlockData => {

  const keys: Set<string> = new Set()

  let lastSort = 0

  const blocks: BlockData = {
    data: [],
    add: (block: Voxel) => {
      if (keys.has(`${block.x}-${block.y}-${block.z}`)) return

      blocks.data.push(block)
      keys.add(`${block.x}-${block.y}-${block.z}`)
    },
    remove: (block: XYZ) => {
      const index = blocks.data.findIndex(b => b.x === block.x && b.y === block.y && b.z === block.z)
      if (index !== -1) {
        blocks.data.splice(index, 1)
        keys.delete(`${block.x}-${block.y}-${block.z}`)
      }
    },
    sort: (world: World) => {
      if (lastSort === world.tick) {
        return blocks.data
      } else {
        lastSort = world.tick
      }

      const time = performance.now()
      blocks.data.sort((a, b) => {
        const XYa = world.flip(a)
        const XYb = world.flip(b)

        if (XYa.y !== XYb.y) return XYa.y - XYb.y
        if (a.z !== b.z) return a.z - b.z
        return XYa.x - XYb.x
      })

      return blocks.data

      // console.log('sort', performance.now() - time)
    }
  }

  return blocks
}

export const blocks = BlockData()


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
