import {
  BlockDimensions, floor, round, Block, XY, XYZ, BlockTree, randomInt,
  BlockType, BlockTypeInt, range, sample, logPerf, hypot, angleCC,
  keys, World, BlockTypeString, BlockItem, randomHash
} from "@piggo-gg/core"

const { width, height } = BlockDimensions

export type BlockData = {
  atMouse: (mouse: XY, player: XYZ) => { block: Block, face: 0 | 1 | 2 } | null
  fromMouse: (mouse: XY, player: XYZ) => Block | null
  adjacent: (block: XY) => Block[] | null
  add: (block: Block) => boolean
  visible: (at: XY[], flip?: boolean) => Block[]
  data: (at: XY[], flip?: boolean) => Block[]
  invalidate: (c?: "cache" | "visibleCache") => void
  hasXYZ: (block: XYZ) => boolean
  remove: (xyz: XYZ, world?: World) => void
}

export const BlockData = (): BlockData => {

  const data: Int8Array[][] = []

  const chunks = 100
  for (let i = 0; i < chunks; i++) {
    data[i] = []
    for (let j = 0; j < chunks; j++) {
      data[i][j] = new Int8Array(4 * 4 * 32)
    }
  }

  const cache: Record<string, Block[]> = {}
  const dirty: Record<string, boolean> = {}

  const visibleCache: Record<string, Block[]> = {}
  const visibleDirty: Record<string, boolean> = {}

  const chunkey = (x: number, y: number) => `${x}:${y}`
  const chunkval = (x: number, y: number) => data[x]?.[y]

  const val = (x: number, y: number, z: number) => {
    const chunkX = floor(x / 4)
    const chunkY = floor(y / 4)

    const chunk = chunkval(chunkX, chunkY)
    if (!chunk) return chunk

    const xIndex = x - chunkX * 4
    const yIndex = y - chunkY * 4
    const index = z * 16 + yIndex * 4 + xIndex

    return chunk[index]
  }

  const blocks: BlockData = {
    atMouse: (mouse: XY, player: XYZ) => {
      const playerChunk = XYtoChunk(player)

      const allBlocks = blocks.adjacent(playerChunk)
      if (!allBlocks) return null

      let found: Block | null = null
      let face: 0 | 1 | 2 = 0

      for (let i = allBlocks.length - 1; i >= 0; i--) {
        const block = allBlocks[i]
        const { x, y, z } = block

        const playerDist = hypot(player.x - x, player.y - y, player.z - z)
        if (playerDist > 120) continue

        const screenY = y - z - height
        const dx = mouse.x - x
        const dy = mouse.y - screenY

        // circle
        const d = hypot(dx, dy)
        if (d > width) continue

        found = { ...block }

        // angle
        const angle = angleCC(dx, dy)
        if (angle > 30 && angle <= 150) {
          face = 0
        } else if (angle > 150 && angle < 270) {
          face = 2
        } else {
          face = 1
        }

        break
      }
      if (!found) return null

      return { block: found, face }
    },
    fromMouse: (mouse: XY, player: XYZ) => {
      const playerChunk = XYtoChunk(player)

      const allBlocks = blocks.adjacent(playerChunk)
      if (!allBlocks) return null

      let found: Block | null = null

      for (let i = allBlocks.length - 1; i >= 0; i--) {
        const block = allBlocks[i]
        const { x, y, z } = block

        const playerDist = hypot(player.x - x, player.y - y, player.z - z)
        if (playerDist > 120) continue

        const screenY = y - z - height
        const dx = mouse.x - x
        const dy = mouse.y - screenY

        // circle
        const d = hypot(dx, dy)
        if (d > width) continue

        const maybe = { ...block }

        // angle
        const angle = angleCC(dx, dy)
        if (angle > 30 && angle <= 150) {
          maybe.z += 21
        } else if (angle > 150 && angle < 270) {
          maybe.x += 18
          maybe.y += 9
        } else {
          maybe.x -= 18
          maybe.y += 9
        }

        if (!blocks.hasXYZ(maybe)) found = maybe

        break
      }
      return found
    },
    adjacent: (block: XY) => {
      const data: Block[] = []
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          const t = cache[chunkey(block.x + i, block.y + j)]
          if (!t) return null
          data.push(...t)
        }
      }
      return data
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
        // console.error("BLOCK ALREADY EXISTS", x, y, block.z)
        return false
      }

      data[chunkX][chunkY][index] = block.type

      const key = chunkey(chunkX, chunkY)

      dirty[key] = true
      visibleDirty[key] = true

      return true
    },
    visible: (at: XY[], flip: boolean = false) => {
      const result: Block[] = []
      const time = performance.now()

      const start = flip ? at.length - 1 : 0
      const end = flip ? -1 : at.length
      const step = flip ? -1 : 1

      for (let i = start; i !== end; i += step) {
        const pos = at[i]

        // chunk exists
        const chunk = chunkval(pos.x, pos.y)
        if (!chunk) continue

        // read the visibleCache
        const key = `${pos.x}:${pos.y}`
        if (visibleCache[key] && !visibleDirty[key]) {
          result.push(...visibleCache[key])
          continue
        }

        const chunkResult: Block[] = []

        // find blocks in the chunk
        for (let z = 0; z < 32; z++) {
          for (let y = flip ? 3 : 0; flip ? y >= 0 : y < 4; flip ? y-- : y++) {
            for (let x = flip ? 3 : 0; flip ? x >= 0 : x < 4; flip ? x-- : x++) {

              const index = z * 16 + y * 4 + x
              const type = chunk[index]
              if (type === 0) continue

              const dir = flip ? -1 : 1

              // check if the block is visible
              if (
                !val(pos.x * 4 + x + dir, pos.y * 4 + y, z) ||
                !val(pos.x * 4 + x, pos.y * 4 + y + dir, z) ||
                !val(pos.x * 4 + x, pos.y * 4 + y, z + 1)
              ) {
                const xyz = intToXYZ(x + pos.x * 4, y + pos.y * 4, z)
                const block: Block = { ...xyz, type }
                chunkResult.push(block)
              }
            }
          }
        }
        visibleCache[key] = chunkResult
        visibleDirty[key] = false
        result.push(...chunkResult)
      }

      logPerf("BlockData.visible", time)
      return result
    },
    data: (at: XY[], flip: boolean = false) => {
      const result: Block[] = []
      const time = performance.now()

      const start = flip ? at.length - 1 : 0
      const end = flip ? -1 : at.length
      const step = flip ? -1 : 1

      for (let i = start; i !== end; i += step) {
        const pos = at[i]

        // chunk exists
        const chunk = chunkval(pos.x, pos.y)
        if (!chunk) continue

        // read the cache
        const key = `${pos.x}:${pos.y}`
        if (cache[key] && !dirty[key]) {
          result.push(...cache[key])
          continue
        }

        const chunkResult: Block[] = []

        // find blocks in the chunk
        for (let z = 0; z < 32; z++) {
          for (let y = flip ? 3 : 0; flip ? y >= 0 : y < 4; flip ? y-- : y++) {
            for (let x = flip ? 3 : 0; flip ? x >= 0 : x < 4; flip ? x-- : x++) {

              const index = z * 16 + y * 4 + x
              const type = chunk[index]
              if (type === 0) continue

              const xyz = intToXYZ(x + pos.x * 4, y + pos.y * 4, z)
              const block: Block = { ...xyz, type }
              chunkResult.push(block)
            }
          }
        }
        cache[key] = chunkResult
        dirty[key] = false
        result.push(...chunkResult)
      }

      logPerf("BlockData.visible", time)
      return result
    },
    invalidate: (c: "cache" | "visibleCache" = "cache") => {

      if (c === "visibleCache") {
        for (const value of keys(visibleDirty)) {
          visibleDirty[value] = true
        }
      } else {
        for (const value of keys(dirty)) {
          dirty[value] = true
        }
      }
    },
    hasXYZ: (block: XYZ) => {
      const chunk = XYtoChunk(block)

      const ijk = XYZtoIJK(block)
      const x = ijk.x - chunk.x * 4
      const y = ijk.y - chunk.y * 4

      const index = ijk.z * 16 + y * 4 + x

      return Boolean((data[chunk.x]?.[chunk.y][index]))
    },
    remove: ({ x, y, z }, world) => {
      const chunkX = floor(x / 4)
      const chunkY = floor(y / 4)

      if (!data[chunkX]?.[chunkY]) {
        console.error("CHUNK NOT FOUND", chunkX, chunkY)
        return
      }

      const xIndex = x - chunkX * 4
      const yIndex = y - chunkY * 4

      const index = z * 16 + yIndex * 4 + xIndex

      if (data[chunkX][chunkY][index] === undefined) {
        console.error("INVALID INDEX", index, xIndex, yIndex, z)
        return
      }

      const blockType = BlockTypeString[data[chunkX][chunkY][index]]

      // spawn item
      if (blockType && world) {
        const playerCharacter = world.client?.playerCharacter()
        if (playerCharacter) {
          const item = BlockItem(blockType)({ character: playerCharacter, id: randomHash() })
          const xy = intToXY(x, y)
          item.components.position.data.follows = undefined
          item.components.position.setPosition({ ...xy, z: (z + 1) * 21 })
          item.components.item.dropped = true

          world.addEntity(item)
        }
      }

      data[chunkX][chunkY][index] = 0

      const key = chunkey(chunkX, chunkY)

      dirty[key] = true
      visibleDirty[key] = true
    }
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

        if (z === height - 1 && type === "grass" && randomInt(200) === 1) {
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

export const highestBlock = (pos: XY, chunks: XY[], max?: number): XYZ => {
  const snapped = snapXY(pos)

  let level = 0

  // todo this is slow, should be a spatial hash ?
  for (const block of blocks.data(chunks)) {
    const { x, y, z } = block
    if (x === snapped.x && y === snapped.y) {
      if (max && z > max) continue
      level = Math.max(level, z + 21)
    }
  }

  return { x: snapped.x, y: snapped.y, z: level }
}

export const chunkNeighors = (chunk: XY): XY[] => ([
  chunk,
  { x: chunk.x - 1, y: chunk.y },
  { x: chunk.x + 1, y: chunk.y },
  { x: chunk.x, y: chunk.y - 1 },
  { x: chunk.x, y: chunk.y + 1 },
  { x: chunk.x - 1, y: chunk.y - 1 },
  { x: chunk.x + 1, y: chunk.y - 1 },
  { x: chunk.x - 1, y: chunk.y + 1 },
  { x: chunk.x + 1, y: chunk.y + 1 }
])
