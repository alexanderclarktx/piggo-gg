import { Collider, Entity, Expires, Networked, Position, PositionProps, Renderable, SensorCallback, TeamNumber, World, pixiCircle } from "@piggo-gg/core";

export type ProjectileProps = {
  id: string
  radius: number
  color: number
  pos?: PositionProps
  onHit?: SensorCallback
  visible?: boolean
  expireTicks?: number
}

export const onHitTeam = (allyTeam: TeamNumber, damage: number): SensorCallback => (e2: Entity<Position | Collider>) => {
  const { collider, health, team } = e2.components;
  if (health && collider.shootable) {
    if (!team || (team.data.team !== allyTeam)) {
      health.data.health -= damage;
      health.onDamage?.(damage);
      return true;
    }
  }
  return false;
}

const onHitDefault = (e2: Entity<Position | Collider>) => {
  const { collider, health } = e2.components;
  if (collider.shootable && health) {
    health.data.health -= 25;
    return true;
  }
  return false;
}

export const Projectile = ({ radius, pos, id, color, visible, expireTicks, onHit = onHitDefault }: ProjectileProps) => {
  const projectile = Entity({
    id,
    components: {
      position: Position(pos ? pos : { x: 200, y: 200, velocity: { x: 50, y: 0 }}),
      networked: Networked({ isNetworked: true }),
      expires: Expires({ ticksLeft: expireTicks ?? 35 }),
      collider: Collider({
        shape: "cuboid",
        length: radius ?? 8,
        width: radius ?? 8,
        ccd: true,
        sensor: (e2: Entity<Position | Collider>, world: World) => {
          const hit = onHit(e2, world);
          if (hit) world.removeEntity(projectile.id);
          return hit;
        }
      }),
      renderable: Renderable({
        zIndex: 3,
        interpolate: true,
        visible: visible ?? true,
        setContainer: async () => {
          return pixiCircle({ x: 0, y: 0, r: radius ?? 8, style: { color, alpha: 1, strokeColor: 0x000000, strokeWidth: 1, strokeAlpha: 0.5 } });
        }
      })
    }
  })

  return projectile
}
