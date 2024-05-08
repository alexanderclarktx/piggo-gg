import { Collider, Entity, Expires, Networked, Position, Renderable, World, pixiCircle } from "@piggo-gg/core";

export type ProjectileProps = {
  id: string
  radius: number
  pos?: { x: number, y: number, vx: number, vy: number }
}

export const Projectile = ({ radius, pos, id }: ProjectileProps) => {
  const projectile = Entity({
    id,
    components: {
      position: new Position(pos ?
        { x: pos.x, y: pos.y, velocityX: pos.vx, velocityY: pos.vy } :
        { x: 200, y: 200, velocityX: 50, velocityY: 0 }
      ),
      networked: new Networked({ isNetworked: true }),
      expires: new Expires({ ticksLeft: 60 }),
      collider: new Collider({
        shape: "ball",
        radius: radius ?? 10,
        sensor: (e2: Entity<Position | Collider>, world: World) => {
          if (e2.components.collider.shootable) {
            if (e2.components.health) {
              e2.components.health.data.health -= 25;
            }
            world.removeEntity(projectile.id);
          }
        }
      }),
      renderable: new Renderable({
        zIndex: 3,
        setContainer: async () => {
          return pixiCircle({ x: 0, y: 0, r: radius ?? 8, style: { color: 0xffff00, alpha: 1 } });
        }
      })
    }
  })

  return projectile
}
