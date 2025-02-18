import {
  Collider, Entity, Expires, Networked, Position, PositionProps,
  Renderable, SensorCallback, TeamNumber, World, pixiCircle
} from "@piggo-gg/core"

export const onHitTeam = (allyTeam: TeamNumber, damage: number): SensorCallback => (e2: Entity<Position | Collider>, world) => {
  const { collider, health, team } = e2.components
  if (health && collider.hittable) {
    if (!team || (team.data.team !== allyTeam)) {
      health.damage(damage, world)
      return true
    }
  }
  return false
}

const onHitDefault = (e2: Entity<Position | Collider>, world: World) => {
  const { collider, health } = e2.components
  if (collider.hittable && health) {
    health.damage(25, world)
    return true
  }
  return false
}

export type HitboxProps = {
  id: string
  radius: number
  color?: number
  pos?: PositionProps
  onHit?: SensorCallback
  visible?: boolean
  expireTicks?: number
  onExpire?: () => void
}

export const Hitbox = ({ radius, pos, id, color, visible, expireTicks, onExpire, onHit = onHitDefault }: HitboxProps) => {
  const hitbox = Entity({
    id,
    components: {
      position: Position(pos ? pos : { x: 200, y: 200, velocity: { x: 50, y: 0 } }),
      networked: Networked(),
      expires: Expires({ ticksLeft: expireTicks ?? 35, onExpire: onExpire ?? (() => { }) }),
      collider: Collider({
        shape: "cuboid",
        length: radius ?? 8,
        width: radius ?? 8,
        sensor: (e2: Entity<Position | Collider>, world: World) => {
          const hit = onHit(e2, world)
          if (hit) world.removeEntity(hitbox.id)
          return hit
        }
      }),
      renderable: Renderable({
        zIndex: 3,
        interpolate: true,
        visible: visible ?? true,
        setContainer: async () => {
          return pixiCircle({
            x: 0, y: 0, r: radius ?? 8,
            style: { color: 0x222222, alpha: 1, strokeColor: color ?? 0xffffff, strokeWidth: 1 }
          })
        }
      })
    }
  })
  return hitbox
}
