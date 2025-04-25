import { BlockDimensions, Collider, Entity, Position } from "@piggo-gg/core"

const { width, height } = BlockDimensions

export const BlockCollider = (n: number) => Entity<Position | Collider>({
  id: `terrain-collider-${n}`,
  components: {
    position: Position(),
    collider: Collider({
      cullable: true,
      group: "1",
      hittable: true,
      isStatic: true,
      shape: "line",
      points: [
        0, width / 2,
        -width, 0,
        0, 3 - height,
        width, 0,
        0, width / 2
      ]
    })
  }
})
