import {
  Actions, Chase, Collider, Debug, Entity, Health, InvokedAction,
  NPC, Networked, Position, PositionProps, Renderable, World,
  closestEntity, loadTexture, random, round
} from "@piggo-gg/core";
import { AnimatedSprite } from "pixi.js";

export type OinkyProps = {
  id?: string
  positionProps?: PositionProps
}

export const Oinky = ({ id, positionProps = { x: 100, y: 100 } }: OinkyProps = {}) => {
  const oinky = Entity<Health | Actions>({
    id: id ?? `oinky-${round(random() * 100)}`,
    components: {
      position: Position({ ...positionProps, velocityResets: 1, speed: positionProps.speed ?? 30 }),
      networked: Networked({ isNetworked: true }),
      health: Health({ health: 600 }),
      npc: NPC({ npcOnTick }),
      actions: Actions({
        "chase": Chase
      }),
      collider: Collider({ shape: "ball", radius: 8, mass: 300, shootable: true }),
      debug: Debug(),
      renderable: Renderable({
        scale: 2,
        zIndex: 3,
        interpolate: true,
        color: 0xffffff,
        scaleMode: "nearest",
        anchor: { x: 0.5, y: 0.7 },
        dynamic: (_, r, z) => {
          const animation = z.components.renderable?.activeAnimation

          if (animation && ["l", "dl", "ul"].includes(animation)) {
            r.setScale({x: -1, y: 1});
          } else {
            r.setScale({x: 1, y: 1});
          }
        },
        setup: async (r: Renderable) => {
          const t = await loadTexture("oinky.json")
          r.animations = {
            d: new AnimatedSprite([t["2"], t["1"], t["3"]]),
            u: new AnimatedSprite([t["2"], t["1"], t["3"]]),
            l: new AnimatedSprite([t["2"], t["1"], t["3"]]),
            r: new AnimatedSprite([t["2"], t["1"], t["3"]]),
            dl: new AnimatedSprite([t["2"], t["1"], t["3"]]),
            dr: new AnimatedSprite([t["2"], t["1"], t["3"]]),
            ul: new AnimatedSprite([t["2"], t["1"], t["3"]]),
            ur: new AnimatedSprite([t["2"], t["1"], t["3"]])
          }
        }
      })
    }
  })
  return oinky;
}

const npcOnTick = (entity: Entity<Position>, world: World): void | InvokedAction => {
  const { position } = entity.components;

  // TODO food entities
  const entitiesWithHealth = world.queryEntities(["health", "position"])
    .filter((e) => !(e.id.includes("oinky"))) as Entity<Health | Position>[];

  const closest = closestEntity(entitiesWithHealth, position.data);
  if (!closest) return;

  return { action: "chase", params: { target: closest } }
}
