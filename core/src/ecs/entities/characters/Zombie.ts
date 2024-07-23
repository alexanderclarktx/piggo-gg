import { Actions, Chase, Collider, Debug, Entity, Health, NPC, Networked, Position, PositionProps, Renderable, loadTexture } from "@piggo-gg/core";
import { AnimatedSprite } from "pixi.js";

export type ZombieProps = {
  id?: string
  color?: number
  positionProps?: PositionProps
}

const colors = [0xff3300, 0xff7700, 0xccee00, 0x00ff00];

export const Zombie = ({ id, color, positionProps = { x: 100, y: 100 } }: ZombieProps = {}) => {
  const zombie = Entity<Health>({
    id: id ?? `zombie-${Math.round(Math.random() * 100)}`,
    components: {
      position: Position({ ...positionProps, velocityResets: 1, speed: positionProps.speed ?? 30 }),
      networked: Networked({ isNetworked: true }),
      health: Health({ health: 60 }),
      npc: NPC({
        onTick: (_) => ({ action: "chase", playerId: "" })
      }),
      actions: Actions({
        "chase": Chase
      }),
      collider: Collider({ shape: "ball", radius: 8, mass: 300, shootable: true }),
      debug: Debug(),
      renderable: Renderable({
        scale: 2,
        zIndex: 3,
        interpolate: true,
        color: color ?? 0x00ff00,
        scaleMode: "nearest",
        anchor: { x: 0.5, y: 0.7 },
        dynamic: (_, r) => {
          const { health, maxHealth } = zombie.components.health.data;

          const ratio = Math.round(health / maxHealth * 4);
          r.color = colors[ratio - 1];
        },
        setup: async (r: Renderable) => {
          const textures = await loadTexture("chars.json")
          r.animations = {
            d: new AnimatedSprite([textures["d1"], textures["d2"], textures["d3"]]),
            u: new AnimatedSprite([textures["u1"], textures["u2"], textures["u3"]]),
            l: new AnimatedSprite([textures["l1"], textures["l2"], textures["l3"]]),
            r: new AnimatedSprite([textures["r1"], textures["r2"], textures["r3"]]),
            dl: new AnimatedSprite([textures["dl1"], textures["dl2"], textures["dl3"]]),
            dr: new AnimatedSprite([textures["dr1"], textures["dr2"], textures["dr3"]]),
            ul: new AnimatedSprite([textures["ul1"], textures["ul2"], textures["ul3"]]),
            ur: new AnimatedSprite([textures["ur1"], textures["ur2"], textures["ur3"]])
          }
        }
      })
    }
  })
  return zombie;
}
