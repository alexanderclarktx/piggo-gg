import { BlockPlan, BlockTypeInt, XYZ } from "@piggo-gg/core"

export const BlockTree = ({ x, y, z }: XYZ): BlockPlan => {
  const plan: BlockPlan = []

  const height = 5
  let leafWidth = 4

  for (let i = 0; i < height; i++) {
    plan.push({
      x, y, z: z + i * 21, type: BlockTypeInt["wood"]
    })
  }

  // put leafs all around the top
  for (let i = 0; i < leafWidth; i++) {
    // plan.push({
    //   x: x + i * 18, y: y, z: z + (height) * 21, type: BlockTypeInt["leaf"]
    // })
    // plan.push({
    //   x: x - i, y: y, z: z + (height) * 21, type: BlockTypeInt["leaf"]
    // })
    // plan.push({
    //   x: x, y: y + i, z: z + (height) * 21, type: BlockTypeInt["leaf"]
    // })
    // plan.push({
    //   x: x, y: y - i, z: z + (height) * 21, type: BlockTypeInt["leaf"]
    // })
  }

  return plan
}
