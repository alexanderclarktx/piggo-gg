import { Collider, Entity, Health, Networked, Position, Renderable, SensorCallback, XY } from "@piggo-gg/core"
import { Graphics } from "pixi.js"

export type LineWallProps = {
  points: number[]
  position?: XY
  visible?: boolean
  health?: number
  hittable?: boolean
  sensor?: SensorCallback
  id?: string
}

export const LineWall = (
  { points, position, visible, health, id, hittable, sensor }: LineWallProps
): Entity<Position | Renderable | Collider> => {

  let newPoints: number[] = []

  if (position) {
    newPoints = points
  } else {
    newPoints = points.map((point, i) => {
      if (i % 2 === 0) {
        return point - points[0]
      } else {
        return point - points[1]
      }
    })
  }

  const wall = Entity<Position | Renderable | Collider>({
    id: id ?? `linewall-${points.join("-")}-${position?.x}-${position?.y}`,
    components: {
      position: Position({ x: position?.x ?? points[0], y: position?.y ?? points[1] }),
      ...health ? { health: Health({ health, showHealthBar: false }) } : {},
      networked: Networked(),
      collider: Collider({
        shape: "line",
        isStatic: true,
        points: newPoints,
        priority: 1,
        hittable: hittable ?? true,
        ...(sensor ? { sensor } : {})
      }),
      renderable: Renderable({
        visible: visible ?? false,
        zIndex: 3,
        dynamic: ({ container }) => {
          if (!wall.components.health) return

          const { health, maxHealth } = wall.components.health.data
          if (health <= 0) return

          const white = 255 * health / maxHealth

          const g = container as Graphics
          g.tint = (white << 16) + (255 << 8) + 255
        },
        setContainer: async () => {
          const g = new Graphics()
          for (let i = 2; i < newPoints.length; i += 2) {
            g.lineTo(newPoints[i], newPoints[i + 1])
          }
          g.stroke({ width: 2, color: 0xffffff })
          return g
        }
      })
    }
  })
  return wall
}
