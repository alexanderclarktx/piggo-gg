import { Collider, Entity, Expires, Networked, Position, Renderable, TeamNumber, World, pixiCircle } from "@piggo-gg/core";

export type OnHitHandler = (e2: Entity<Position | Collider>, world: World) => boolean

export type ProjectileProps = {
  id: string
  radius: number
  pos?: { x: number, y: number, vx: number, vy: number }
  onHit?: OnHitHandler
}

export const onHitTeam = (allyTeam: TeamNumber): OnHitHandler => (e2: Entity<Position | Collider>) => {
  const { collider, health, team } = e2.components;
  if (health && collider.shootable) {
    if (!team || (team.data.team !== allyTeam)) {
      health.data.health -= 25;
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

export const Projectile = ({ radius, pos, id, onHit = onHitDefault }: ProjectileProps) => {
  const projectile = Entity({
    id,
    components: {
      position: new Position(pos ? pos : { x: 200, y: 200, vx: 50, vy: 0 }),
      networked: new Networked({ isNetworked: true }),
      expires: new Expires({ ticksLeft: 35 }),
      collider: new Collider({
        shape: "cuboid",
        length: radius ?? 8,
        width: radius ?? 8,
        ccd: true,
        sensor: (e2: Entity<Position | Collider>, world: World) => {
          if (onHit(e2, world)) world.removeEntity(projectile.id);
        }
      }),
      renderable: new Renderable({
        zIndex: 3,
        interpolate: true,
        setContainer: async () => {
          return pixiCircle({ x: 0, y: 0, r: radius ?? 8, style: { color: 0xffff00, alpha: 1 } });
        }
      })
    }
  })

  return projectile
}
