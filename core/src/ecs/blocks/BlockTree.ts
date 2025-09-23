import { BlockPlan, BlockTypeInt, XYZ } from "@piggo-gg/core"

export const BlockTree = (xyz: XYZ, height: number, t: "oak" | "spruce", fluffy: boolean): BlockPlan => {
  const plan: BlockPlan = []

  const { x, y, z } = xyz

  for (let i = 1; i <= height; i++) {
    plan.push({ x, y, z: z + i, type: BlockTypeInt[t] })
  }

  const type = t === "spruce" ? BlockTypeInt["spruceLeaf"] : BlockTypeInt["oakLeaf"]

  plan.push(
    { x: x + 1, y, z: z + height, type },
    { x: x - 1, y, z: z + height, type },
    { x, y: y + 1, z: z + height, type },
    { x, y: y - 1, z: z + height, type },
    { x, y, z: z + height + 1, type }
  )

  if (fluffy) plan.push(
    { x: x + 1, y: y + 1, z: z + height, type },
    { x: x - 1, y: y + 1, z: z + height, type },
    { x: x + 1, y: y - 1, z: z + height, type },
    { x: x - 1, y: y - 1, z: z + height, type },
  )

  return plan
}
