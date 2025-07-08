import {
  BlockPlan, BlockType, BlockTypeInt, randomChoice, randomInt, XYZ
} from "@piggo-gg/core"

export const BlockTree = ({ x, y, z }: XYZ): BlockPlan => {
  const plan: BlockPlan = []

  let height = randomInt(2) + 4

  if (randomInt(4) === 1) {
    height += randomInt(5)
  }

  const woodType = randomChoice(["wood", "obsidian"]) as BlockType

  for (let i = 1; i <= height; i++) {
    plan.push({
      x, y, z: z + i, type: BlockTypeInt[woodType]
    })
  }
  
  const leaf = randomChoice(["leaf"]) as BlockType
  const type = BlockTypeInt[leaf]

  plan.push(
    { x: x + 1, y, z: z + height, type },
    { x: x - 1, y, z: z + height, type },
    { x, y: y + 1, z: z + height, type },
    { x, y: y - 1, z: z + height, type },
    { x, y, z: z + height + 1, type }
  )

  const fluffy = randomInt(2) === 1

  if (fluffy) plan.push(
    { x: x + 1, y: y + 1, z: z + height, type },
    { x: x - 1, y: y + 1, z: z + height, type },
    { x: x + 1, y: y - 1, z: z + height, type },
    { x: x - 1, y: y - 1, z: z + height, type },
  )

  return plan
}
