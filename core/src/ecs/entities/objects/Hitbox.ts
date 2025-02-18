import {
  Collider, Entity, Expires, Networked, Position, PositionProps,
  Renderable, SensorCallback, TeamNumber, World, pixiCircle
} from "@piggo-gg/core"

export type DamageCalculation = (entity: Entity<Position | Collider>) => number

export const onHitCalculate = (ally: TeamNumber, damageCalc: DamageCalculation): SensorCallback => (e2, world) => {
  const { collider, health, team } = e2.components
  if (health && collider.hittable) {
    if (!team || (team.data.team !== ally)) {
      health.damage(damageCalc(e2), world)
      return true
    }
  }
  return false
}

export const onHitFlat = (ally: TeamNumber, damage: number): SensorCallback => (e2, world) => {
  const { collider, health, team } = e2.components
  if (health && collider.hittable) {
    if (!team || (team.data.team !== ally)) {
      console.log("HIT", e2.id, damage)
      health.damage(damage, world)
      return true
    }
  }
  return false
}

export type HitboxProps = {
  id: string
  radius: number
  onHit: SensorCallback
  color?: number
  pos?: PositionProps
  visible?: boolean
  expireTicks?: number
  onExpire?: () => void
}

export const Hitbox = ({ radius, pos, id, color, visible, expireTicks, onExpire, onHit }: HitboxProps) => {
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
          console.log("sensor hit check", id, e2.id)
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
