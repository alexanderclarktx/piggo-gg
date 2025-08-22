import {
  Block, BlockTree, BlockType, BlockTypeInt,
  floor, keys, logPerf, World, XY, XYZ
} from "@piggo-gg/core"

export type BlockData = {
  add: (block: Block) => boolean
  clear: () => void
  hasIJK: (ijk: XYZ) => boolean
  highestBlockIJ: (pos: XY, max?: number) => XYZ | undefined
  neighbors: (chunk: XY, dist?: number) => XY[]
  invalidate: () => void
  remove: (xyz: XYZ, world?: World) => void
  needsUpdate: () => boolean
  visible: (at: XY[]) => Block[]
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
  // let dirty: Record<string, boolean> = {}

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
    clear: () => {
      for (let i = 0; i < chunks; i++) {
        for (let j = 0; j < chunks; j++) {
          data[i][j].fill(0)
        }
      }
      cache = {}
      visibleCache = {}
      visibleDirty = {}
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

      visibleDirty[key] = true

      return true
    },
    visible: (at: XY[]) => {
      const result: Block[] = []
      const time = performance.now()

      const start = 0
      const end = at.length
      const step = 1

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
        } else {
          console.log("no cache")
        }

        const chunkResult: Block[] = []

        // find blocks in the chunk
        for (let z = 0; z < 32; z++) {
          for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {

              const index = z * 16 + y * 4 + x
              const type = chunk[index]
              if (type === 0) continue

              const dir = 1

              // check if the block is visible
              if (
                !val(pos.x * 4 + x + dir, pos.y * 4 + y, z) ||
                !val(pos.x * 4 + x - dir, pos.y * 4 + y, z) ||

                !val(pos.x * 4 + x, pos.y * 4 + y + dir, z) ||
                !val(pos.x * 4 + x, pos.y * 4 + y - dir, z) ||

                !val(pos.x * 4 + x, pos.y * 4 + y, z + 1)
              ) {
                const ijk = { x: x + pos.x * 4, y: y + pos.y * 4, z }

                const block: Block = { ...ijk, type }
                chunkResult.push(block)
              }
            }
          }
        }
        visibleCache[key] = chunkResult
        delete visibleDirty[key]
        result.push(...chunkResult)
      }

      logPerf("BlockData.visible", time)
      return result
    },
    invalidate: () => {
      for (const value of keys(visibleDirty)) {
        visibleDirty[value] = true
      }
    },
    hasIJK: (ijk: XYZ) => {
      const chunkX = floor(ijk.x / 4)
      const chunkY = floor(ijk.y / 4)

      const index = ijk.z * 16 + (ijk.y - chunkY * 4) * 4 + (ijk.x - chunkX * 4)

      return Boolean((data[chunkX]?.[chunkY]?.[index]))
    },
    needsUpdate: () => {
      return Boolean(keys(visibleDirty).length)
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
      visibleDirty[key] = true

      // check if neighbors are also dirty
      if (x % 4 === 0) visibleDirty[chunkey(chunkX - 1, chunkY)] = true
      if (x % 4 === 3) visibleDirty[chunkey(chunkX + 1, chunkY)] = true
      if (y % 4 === 0) visibleDirty[chunkey(chunkX, chunkY - 1)] = true
      if (y % 4 === 3) visibleDirty[chunkey(chunkX, chunkY + 1)] = true
    }
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
