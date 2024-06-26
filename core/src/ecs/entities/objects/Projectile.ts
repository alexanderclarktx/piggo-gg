import { Collider, Entity, Expires, Networked, Position, PositionProps, Renderable, TeamNumber, World, pixiCircle } from "@piggo-gg/core";

export type OnHitHandler = (e2: Entity<Position | Collider>, world: World) => boolean

export type ProjectileProps = {
  id: string
  radius: number
  color: number
  pos?: PositionProps
  onHit?: OnHitHandler
}

export const onHitTeam = (allyTeam: TeamNumber, damage: number): OnHitHandler => (e2: Entity<Position | Collider>) => {
  const { collider, health, team } = e2.components;
  if (health && collider.shootable) {
    if (!team || (team.data.team !== allyTeam)) {
      health.data.health -= damage;
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

export const Projectile = ({ radius, pos, id, color, onHit = onHitDefault }: ProjectileProps) => {
  const projectile = Entity({
    id,
    components: {
      position: Position(pos ? pos : { x: 200, y: 200, velocity: { x: 50, y: 0 }}),
      networked: Networked({ isNetworked: true }),
      expires: Expires({ ticksLeft: 35 }),
      collider: Collider({
        shape: "cuboid",
        length: radius ?? 8,
        width: radius ?? 8,
        ccd: true,
        sensor: (e2: Entity<Position | Collider>, world: World) => {
          if (onHit(e2, world)) world.removeEntity(projectile.id);
        }
      }),
      renderable: Renderable({
        zIndex: 3,
        interpolate: true,
        setContainer: async () => {
          return pixiCircle({ x: 0, y: 0, r: radius ?? 8, style: { color, alpha: 1 } });
        }
      })
    }
  })

  return projectile
}
