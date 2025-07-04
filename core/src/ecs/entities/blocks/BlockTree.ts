import { BlockPlan, BlockTypeInt, randomInt, XYZ } from "@piggo-gg/core"

export const BlockTree = ({ x, y, z }: XYZ): BlockPlan => {
  const plan: BlockPlan = []

  const height = randomInt(2) + 4

  for (let i = 1; i <= height; i++) {
    plan.push({
      x, y, z: z + i, type: BlockTypeInt["wood"]
    })
  }

  plan.push(
    { x: x + 1, y, z: z + height, type: BlockTypeInt["moonrock"] },
    { x: x - 1, y, z: z + height, type: BlockTypeInt["moonrock"] },
    { x, y: y + 1, z: z + height, type: BlockTypeInt["moonrock"] },
    { x, y: y - 1, z: z + height, type: BlockTypeInt["moonrock"] },
    { x, y, z: z + height + 1, type: BlockTypeInt["moonrock"] }
  )

  const fluffy = randomInt(2) === 1

  if (fluffy) plan.push(
    { x: x + 1, y: y + 1, z: z + height, type: BlockTypeInt["moonrock"] },
    { x: x - 1, y: y + 1, z: z + height, type: BlockTypeInt["moonrock"] },
    { x: x + 1, y: y - 1, z: z + height, type: BlockTypeInt["moonrock"] },
    { x: x - 1, y: y - 1, z: z + height, type: BlockTypeInt["moonrock"] },
  )

  return plan
}
