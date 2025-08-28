import { floor, XYZ } from "@piggo-gg/core"

export const blockFromXYZ = (xyz: XYZ) => ({
  x: floor((0.15 + xyz.x) / 0.3),
  y: floor((0.15 + xyz.y) / 0.3),
  z: floor(xyz.z / 0.3)
})
