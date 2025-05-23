import {
  Actions, Chase, Collider, Debug, Entity, Health, InvokedAction, NPC,
  Networked, Position, PositionProps, Renderable, World, closestEntity,
  positionDelta, loadTexture, round, randomInt, max, Element, Action
} from "@piggo-gg/core"
import { AnimatedSprite } from "pixi.js"

export type ZomiProps = {
  id?: string
  color?: number
  positionProps?: PositionProps
}

const colors = [0xff3300, 0xff7700, 0xccee00, 0x00ff00]

export const Zomi = ({ id, color, positionProps = { x: randomInt(200, 100), y: randomInt(200, 100) } }: ZomiProps = {}) => {
  const zomi = Entity<Health | Actions>({
    id: id ?? `zomi-${randomInt(1000)}`,
    components: {
      position: Position({ ...positionProps, velocityResets: 1, speed: positionProps.speed ?? 30 }),
      networked: Networked(),
      health: Health({ hp: 60, deathSounds: ["zombieDeath1", "zombieDeath2", "zombieDeath3", "zombieDeath4"] }),
      npc: NPC({ behavior }),
      actions: Actions({
        "chase": Chase,
        "attack": ZomiAttack(10, 40)
      }),
      element: Element("flesh"),
      collider: Collider({ shape: "ball", radius: 8, mass: 300, hittable: true }),
      debug: Debug(),
      renderable: Renderable({
        scale: 2,
        zIndex: 3,
        interpolate: true,
        color: color ?? 0x00ff00,
        scaleMode: "nearest",
        anchor: { x: 0.5, y: 0.7 },
        onTick: ({ renderable }) => {
          const { hp, maxHp } = zomi.components.health.data

          const ratio = round(hp / maxHp * 4)
          renderable.color = colors[max(ratio - 1, 0)]
        },
        setup: async (r: Renderable) => {
          const t = await loadTexture("chars.json")
          r.animations = {
            d: new AnimatedSprite([t["d1"], t["d2"], t["d3"]]),
            u: new AnimatedSprite([t["u1"], t["u2"], t["u3"]]),
            l: new AnimatedSprite([t["l1"], t["l2"], t["l3"]]),
            r: new AnimatedSprite([t["r1"], t["r2"], t["r3"]]),
            dl: new AnimatedSprite([t["dl1"], t["dl2"], t["dl3"]]),
            dr: new AnimatedSprite([t["dr1"], t["dr2"], t["dr3"]]),
            ul: new AnimatedSprite([t["ul1"], t["ul2"], t["ul3"]]),
            ur: new AnimatedSprite([t["ur1"], t["ur2"], t["ur3"]])
          }
        }
      })
    }
  })
  return zomi
}

const behavior = (entity: Entity<Position>, world: World): void | InvokedAction => {
  const { position } = entity.components

  const targets = world.queryEntities<Health | Position | Element>(["health", "position", "element"])
    .filter((e) => !(e.id.includes("zomi")))
    .filter((e) => e.components.element!.data.kind === "flesh")

  const closest = closestEntity(position.data, targets)
  if (!closest) return

  const distance = positionDelta(position, closest.components.position)
  if (distance < 30) return { actionId: "attack", params: { target: closest } }

  return { actionId: "chase", params: { target: closest.id } }
}

export const ZomiAttack = (damage: number, cooldown: number) => Action<{ target: Entity }>("ZomiAttack", ({ entity, params, world }) => {
  const { target } = params
  const { health } = target.components

  if (health) health.data.hp -= damage

  entity?.components.position?.clearHeading()

  target.components.health?.onDamage?.(damage, world)

  // world.client?.soundManager.play(["attack1", "attack2", "attack3", "attack4"], 0, target.components.position?.data)
}, cooldown)
