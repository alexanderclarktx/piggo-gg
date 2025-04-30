import {
  BlockDimensions, Entity, floor, round, Block, World, XY, XYZ, Position,
  BlockTree, randomInt, BlockType, BlockTypeInt, range, sample, entries
} from "@piggo-gg/core"

const { width, height } = BlockDimensions

export type BlockData = {
  add: (block: Block) => void
  data: () => Block[] // TODO
  remove: (block: Block) => void
}

export const BlockData = (): BlockData => {

  const keys: Set<string> = new Set()
  const data: Block[] = []

  const chunks: Record<string, Int8Array> = {}

  for (let i = 0; i < 20; i++) {
    for (let j = 0; j < 20; j++) {
      const chunk = `${i}:${j}`
      chunks[chunk] = new Int8Array(4 * 4 * 32)
    }
  }

  const chunkIndexFromXY = (x: number, y: number): string => {
    const chunkX = floor(x / 4)
    const chunkY = floor(y / 4)
    return `${chunkX}:${chunkY}`
  }

  const blocks: BlockData = {
    add: (block: Block) => {
      const chunk = chunkIndexFromXY(block.x, block.y)
      if (!chunks[chunk]) {
        console.error("CHUNK NOT FOUND", chunk)
        return
      }

      const index = block.z * 16 + block.y * 4 + block.x
      if (chunks[chunk][index] === undefined) {
        console.error("INVALID INDEX", index)
      }

      chunks[chunk][index] = block.type
    },
    data: () => {
      const result: Block[] = []
      const time = performance.now()
      for (const [chunk, array] of entries(chunks)) {
        const [chunkX, chunkY] = chunk.split(":").map(Number)

        for (let i = 0; i < array.length; i++) {
          const type = array[i]
          if (type === 0) continue

          let x = i % 4 + chunkX * 4
          let y = Math.floor(i / 4) % 4 + chunkY * 4
          let z = Math.floor(i / (4 * 4))

          const xy = intToBlock(x, y)

          const block: Block = { ...xy, z: z * 21, type }
          result.push(block)
        }
      }
      console.log("blocks data", performance.now() - time)
      return result
    },
    remove: ({ x, y, z }: XYZ) => {
      // const index = data.findIndex(b => b.x === x && b.y === y && b.z === z)
      // if (index !== -1) {
      //   data.splice(index, 1)
      //   keys.delete(`${x}-${y}-${z}`)
      // }
    },
    // zSort: () => {
    //   data.sort((a, b) => {
    //     if (a.z !== b.z) return a.z - b.z
    //     return a.y - b.y
    //   })
    //   return data
    // },
    // sort: (world: World) => {
    //   if (lastSort === world.tick) {
    //     return data
    //   } else {
    //     lastSort = world.tick
    //   }

    //   data.sort((a, b) => {
    //     const XYa = world.flip(a)
    //     const XYb = world.flip(b)

    //     if (XYa.y !== XYb.y) return XYa.y - XYb.y
    //     if (a.z !== b.z) return a.z - b.z
    //     return XYa.x - XYb.x
    //   })

    //   return data
    // }
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
  for (const block of blocks.data()) {
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
