import { Voxel, World, XYZ } from "@piggo-gg/core"

export type BlockData = {
  data: Voxel[]
  add: (block: Voxel) => void
  remove: (block: Voxel) => void
  sort: (world: World) => void
}

export const BlockData = (): BlockData => {

  const keys: Set<string> = new Set()

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

      blocks.data.sort((a, b) => {
        const XYa = world.flip(a)
        const XYb = world.flip(b)

        if (XYa.y !== XYb.y) return XYa.y - XYb.y
        if (a.z !== b.z) return a.z - b.z
        return XYa.x - XYb.x
      })
    }
  }

  return blocks
}
