import {
  BlockDimensions, Entity, floor, round, Block, World, XY, XYZ, Position,
  BlockTree, randomInt, BlockType, BlockTypeInt, range, sample, logPerf
} from "@piggo-gg/core"

const { width, height } = BlockDimensions

export type BlockData = {
  atMouse: (mouse: XY, player: XYZ) => XYZ | null
  add: (block: Block) => boolean
  data: (at: XY[]) => Block[]
  remove: (block: Block) => void
}

export const BlockData = (): BlockData => {

  const data: Int8Array[][] = []

  const chunks = 100
  for (let i = 0; i < chunks; i++) {
    data[i] = []
    for (let j = 0; j < chunks; j++) {
      data[i][j] = new Int8Array(4 * 4 * 16)
    }
  }

  const cache: Record<string, Block[]> = {}
  const dirty: Record<string, boolean> = {}

  const chunkey = (x: number, y: number) => `${x}:${y}`
  const chunkval = (x: number, y: number) => data[x]?.[y]

  const blocks: BlockData = {
    atMouse: (mouse: XY, player: XYZ) => {

      const playerChunk = XYtoChunk(player)

      // check blocks in chunk if they are at mouse
      const chunk = cache[chunkey(playerChunk.x, playerChunk.y)]
      if (!chunk) return null

      let found: Block | null = null

      for (let i = chunk.length - 1; i >= 0; i--) {
        const block = chunk[i]
        const { x, y, z } = block

        const screenY = y - z - height

        // circle
        const d = Math.sqrt((x - mouse.x) ** 2 + (screenY - mouse.y) ** 2)
        if (d > width) continue

        found = block
        break
      }

      return found
    },
    add: (block: Block) => {
      const chunkX = floor(block.x / 4)
      const chunkY = floor(block.y / 4)

      if (!data[chunkX]?.[chunkY]) {
        console.error("CHUNK NOT FOUND", chunkX, chunkY)
        return false
      }

      const x = block.x - chunkX * 4
      const y = block.y - chunkY * 4

      const index = block.z * 16 + y * 4 + x

      if (data[chunkX][chunkY][index] === undefined) {
        console.error("INVALID INDEX", index, x, y, block.z)
        return false
      }

      if (data[chunkX][chunkY][index] !== 0) {
        console.error("BLOCK ALREADY EXISTS", x, y, block.z)
        return false
      }

      data[chunkX][chunkY][index] = block.type

      const key = chunkey(chunkX, chunkY)
      dirty[key] = true

      return true
    },
    data: (at: XY[]) => {
      const result: Block[] = []
      const time = performance.now()

      for (const pos of at) {
        const chunk = chunkval(pos.x, pos.y)
        if (!chunk) continue

        const key = `${pos.x}:${pos.y}`
        if (cache[key] && !dirty[key]) {
          result.push(...cache[key])
          continue
        }

        const chunkResult: Block[] = []

        for (let i = 0; i < chunk.length; i++) {
          const type = chunk[i]
          if (type === 0) continue

          let x = pos.x * 4 + i % 4
          let y = pos.y * 4 + floor((i % 16) / 4)
          let z = floor(i / 16)

          const block: Block = { ...intToXYZ(x, y, z), type }
          chunkResult.push(block)
        }
        cache[key] = chunkResult
        dirty[key] = false
        result.push(...chunkResult)
      }

      logPerf("block data", time)
      return result
    },
    remove: ({ x, y, z }: XYZ) => { }
  }

  return blocks
}

export const blocks = BlockData()

export const spawnChunk = (chunk: XY) => {
  const size = 4
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {

      const x = i + chunk.x * size
      const y = j + chunk.y * size

      let height = sample({ x, y, factor: 15, octaves: 3 })

      for (let z = 0; z < height; z++) {

        const type = range<BlockType>(z, [
          [0, "obsidian"],
          [1, "saphire"],
          [7, "grass"],
          [32, "asteroid"]
        ])

        blocks.add({ x, y, z, type: BlockTypeInt[type] })

        if (z === height - 1 && type === "grass" && randomInt(100) === 1) {
          for (const block of BlockTree({ x, y, z })) {
            blocks.add(block)
          }
        }
      }
    }
  }
}

// ij integer coord -> XY of block
export const intToXY = (i: number, j: number): XY => ({
  x: (i - j) * width,
  y: (i + j) * width / 2
})

export const intToXYZ = (i: number, j: number, z: number): XYZ => {
  const xy = intToXY(i, j)
  return { x: xy.x, y: xy.y, z: z * 21 }
}

export const XYZtoIJK = (pos: XYZ): XYZ => {
  const snapped = XYtoIJ(pos)
  const z = floor(pos.z / 21)

  return { x: snapped.x, y: snapped.y, z }
}

export const XYtoChunk = (pos: XY): XY => {
  const snapped = XYtoIJ(pos)
  const x = floor(snapped.x / 4)
  const y = floor(snapped.y / 4)
  return { x, y }
}

export const XYZtoChunk = (pos: XYZ): XYZ => {
  const snapped = XYtoIJ(pos)
  const x = floor(snapped.x / 4)
  const y = floor(snapped.y / 4)
  return { x, y, z: pos.z / 21 }
}

export const XYtoIJ = (pos: XY): XY => {
  const half = width / 2
  const gridX = (pos.x / width + pos.y / half) / 2
  const gridY = (pos.y / half - pos.x / width) / 2
  const tileX = round(gridX)
  const tileY = round(gridY)
  return { x: tileX, y: tileY }
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
  return { z: highestBlock(pos, []).z, ...snapXY(pos) }
}

export const highestBlock = (pos: XY, chunks: XY[]): XYZ => {
  const snapped = snapXY(pos)

  let level = 0

  // todo this is slow, should be a spatial hash ?
  for (const block of blocks.data(chunks)) {
    const { x, y, z } = block
    if (x === snapped.x && y === snapped.y) {
      level = Math.max(level, z + 21)
    }
  }

  return { x: snapped.x, y: snapped.y, z: level }
}

// ------------------------------------

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
