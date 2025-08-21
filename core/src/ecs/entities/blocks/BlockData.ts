import {
  BlockDimensions, floor, round, Block, XY, XYZ, BlockTree,
  BlockType, BlockTypeInt, logPerf, hypot, angleCC,
  keys, World, BlockTypeString, BlockItem, randomHash
} from "@piggo-gg/core"

const { width, height } = BlockDimensions

export type BlockData = {
  add: (block: Block) => boolean
  adjacent: (block: XY) => Block[] | null
  atMouse: (mouse: XY, player: XYZ) => { block: Block, face: 0 | 1 | 2 } | null
  clear: () => void
  data: (at: XY[], flip?: boolean) => Block[]
  fromMouse: (mouse: XY, player: XYZ) => Block | null
  hasXYZ: (block: XYZ) => boolean
  hasIJK: (ijk: XYZ) => boolean
  highestBlockIJ: (pos: XY, max?: number) => XYZ | undefined
  neighbors: (chunk: XY, dist?: number) => XY[]
  invalidate: (c?: "cache" | "visibleCache") => void
  remove: (xyz: XYZ, world?: World) => void
  // removeIJK: (ijk: XYZ, world?: World) => void
  visible: (at: XY[], flip?: boolean, ij?: boolean) => Block[]
}

export const BlockData = (): BlockData => {

  const data: Int8Array[][] = []

  const chunks = 24
  for (let i = 0; i < chunks; i++) {
    data[i] = []
    for (let j = 0; j < chunks; j++) {
      data[i][j] = new Int8Array(4 * 4 * 32)
    }
  }

  let cache: Record<string, Block[]> = {}
  let dirty: Record<string, boolean> = {}

  let visibleCache: Record<string, Block[]> = {}
  let visibleDirty: Record<string, boolean> = {}

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
    highestBlockIJ: (pos: XY, max?: number): XYZ | undefined => {
      let level = 0

      const xChunk = floor(pos.x / 4)
      const yChunk = floor(pos.y / 4)

      const chunk = data[xChunk]?.[yChunk]

      if (max && max > 32) max = 32

      if (chunk !== undefined) {

        const offset = (pos.x - xChunk * 4) + (pos.y - yChunk * 4) * 4

        const zStart = 0
        for (let z = zStart; z < (max ?? 32); z++) {
          const index = z * 16 + offset
          const type = chunk[index]
          if (type !== 0) level = z
        }
        return { x: pos.x, y: pos.y, z: level }
      }
      return undefined
    },
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

        const maybe = { ...block }
        const adjacent = { ...block }

        // angle
        const angle = angleCC(dx, dy)
        if (angle > 30 && angle <= 150) {
          face = 0
          adjacent.z += 21
        } else if (angle > 150 && angle < 270) {
          face = 2
          adjacent.x += 18
          adjacent.y += 9
        } else {
          face = 1
          adjacent.x -= 18
          adjacent.y += 9
        }

        if (!blocks.hasXYZ(adjacent)) {
          found = maybe
          break
        } else {
          continue
        }
      }
      if (!found) return null

      return { block: found, face }
    },
    clear: () => {
      for (let i = 0; i < chunks; i++) {
        for (let j = 0; j < chunks; j++) {
          data[i][j].fill(0)
        }
      }
      cache = {}
      dirty = {}
      visibleCache = {}
      visibleDirty = {}
    },
    fromMouse: (mouse: XY, player: XYZ) => {
      const atMouse = blocks.atMouse(mouse, player)
      if (!atMouse) return null

      const { block, face } = atMouse

      if (face === 0) block.z += 21
      if (face === 1) {
        block.x -= 18
        block.y += 9
      }
      if (face === 2) {
        block.x += 18
        block.y += 9
      }

      return block
    },
    neighbors: (chunk: XY, dist: number = 1) => {
      const neighbors: XY[] = []

      for (let dx = -dist; dx <= dist; dx++) {
        for (let dy = -dist; dy <= dist; dy++) {
          if (!data[chunk.x + dx]?.[chunk.y + dy]) continue
          neighbors.push({ x: chunk.x + dx, y: chunk.y + dy })
        }
      }
      return neighbors
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
        // console.error("CHUNK NOT FOUND", chunkX, chunkY)
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
    visible: (at: XY[], flip: boolean = false, ij: boolean = false) => {
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
                !val(pos.x * 4 + x, pos.y * 4 + y - dir, z) ||
                !val(pos.x * 4 + x - dir, pos.y * 4 + y, z) ||
                !val(pos.x * 4 + x, pos.y * 4 + y, z + 1)
              ) {
                const xyz = ij ?
                  { x: x + pos.x * 4, y: y + pos.y * 4, z } :
                  intToXYZ(x + pos.x * 4, y + pos.y * 4, z)

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
    hasIJK: (ijk: XYZ) => {
      const chunkX = floor(ijk.x / 4)
      const chunkY = floor(ijk.y / 4)

      const index = ijk.z * 16 + (ijk.y - chunkY * 4) * 4 + (ijk.x - chunkX * 4)

      return Boolean((data[chunkX]?.[chunkY]?.[index]))
    },
    remove: ({ x, y, z }, world) => {
      const chunkX = floor(x / 4)
      const chunkY = floor(y / 4)

      if (!data[chunkX]?.[chunkY]) {
        // console.error("CHUNK NOT FOUND", chunkX, chunkY)
        return
      }

      const xIndex = x - chunkX * 4
      const yIndex = y - chunkY * 4

      const index = z * 16 + yIndex * 4 + xIndex

      if (data[chunkX][chunkY][index] === undefined) {
        console.error("INVALID INDEX", index, xIndex, yIndex, z)
        return
      }

      // const blockType = BlockTypeString[data[chunkX][chunkY][index]]

      // // spawn item
      // if (blockType && world) {
      //   const playerCharacter = world.client?.playerCharacter()
      //   if (playerCharacter) {
      //     const item = BlockItem(blockType)({ character: playerCharacter, id: randomHash() })
      //     const xy = intToXY(x, y)
      //     item.components.position.data.follows = undefined
      //     item.components.position.setPosition({ ...xy, z: (z + 1) * 21 })
      //     item.components.item.dropped = true

      //     world.addEntity(item)
      //   }
      // }

      data[chunkX][chunkY][index] = 0

      const key = chunkey(chunkX, chunkY)

      dirty[key] = true
      visibleDirty[key] = true
    },
    // removeIJK: (ijk: XYZ, world?: World) => {
    //   const chunkX = floor(ijk.x / 4)
    //   const chunkY = floor(ijk.y / 4)

    //   if (!data[chunkX]?.[chunkY]) {
    //     // console.error("CHUNK NOT FOUND", chunkX, chunkY)
    //     return
    //   }

    //   const xIndex = ijk.x - chunkX * 4
    //   const yIndex = ijk.y - chunkY * 4

    //   const index = ijk.z * 16 + yIndex * 4 + xIndex

    //   if (data[chunkX][chunkY][index] === undefined) {
    //     console.error("INVALID INDEX", index, xIndex, yIndex, ijk.z)
    //     return
    //   }

    //   data[chunkX][chunkY][index] = 0

    //   const key = chunkey(chunkX, chunkY)

    //   dirty[key] = true
    // }
  }

  return blocks
}

export const spawnChunk = (chunk: XY, world: World) => {
  const size = 4
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {

      const x = i + chunk.x * size
      const y = j + chunk.y * size

      let height = world.random.noise({ x, y, factor: 15, octaves: 3 })

      for (let z = 0; z < height; z++) {

        const type = world.random.range<BlockType>(z, [
          [0, "saphire"],
          [1, "saphire"],
          [7, "grass"],
          [32, "asteroid"]
        ])

        world.blocks.add({ x, y, z, type: BlockTypeInt[type] })

        if (z === height - 1 && type === "grass" && world.random.int(200) === 1) {

          let height = world.random.int(2) + 4
          if (world.random.int(4) === 1) {
            height += world.random.int(5)
          }

          const t = world.random.int(2) === 1 ? "oak" : "spruce"
          const fluffy = world.random.int(2) === 1

          for (const block of BlockTree({ x, y, z }, height, t, fluffy)) {
            world.blocks.add(block)
          }

          world.trees.push({ x: x * 0.3, y: y * 0.3, z: (z + height) * 0.3 + 0.15 })
        }
      }
    }
  }
}


// export const spawnTiny = () => {
//   const num = 8
//   for (let i = 0; i < num; i++) {
//     for (let j = 0; j < num; j++) {
//       blocks.add({ x: i + 5, y: j + 5, z: 0, type: 1 })
//     }
//   }

//   blocks.add({ x: 9, y: 9, z: 1, type: 2 })
// }

export const spawnTerrain = (world: World, num: number = 10) => {
  for (let i = 0; i < num; i++) {
    for (let j = 0; j < num; j++) {
      const chunk = { x: i, y: j }
      spawnChunk(chunk, world)
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

// export const snapXYZ = (pos: XY): XYZ => {
//   return { z: highestBlock(pos, []).z, ...snapXY(pos) }
// }

// export const highestBlock = (pos: XY, chunks: XY[], max?: number): XYZ => {
//   const snapped = snapXY(pos)

//   let level = 0

//   // todo this is slow, should be a spatial hash ?
//   for (const block of blocks.data(chunks)) {
//     const { x, y, z } = block
//     if (x === snapped.x && y === snapped.y) {
//       if (max && z > max) continue
//       level = Math.max(level, z + 21)
//     }
//   }

//   return { x: snapped.x, y: snapped.y, z: level }
// }
