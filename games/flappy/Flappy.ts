import {
  Actions, Character, Collider, Debug, DefaultUI, Effects, Element, Entity,
  GameBuilder, Health, Input, Jump, LineWall, loadTexture, max, Networked,
  Noob, Player, Point, Position, randomInt, Renderable, SensorCallback, SpawnSystem, SystemBuilder, XY
} from "@piggo-gg/core"
import { AnimatedSprite } from "pixi.js"

export const Flappy: GameBuilder = {
  id: "flappy",
  init: (world) => ({
    id: "flappy",
    bgColor: 0x000000,
    view: "side",
    systems: [SpawnSystem(FlappyCharacter), FlappySystem],
    entities: [
      ...DefaultUI(world),
      Floor(), Ceiling()
    ]
  })
}

const sensor: SensorCallback = ({ components }) => {
  if (components.health) components.health.data.health = 0
  return true
}

const PipePair = (x: number) => {
  const h = randomInt(300)

  const top = PipeTop(x, h)
  const bottom = PipeBottom(x, 300 - h)
  return [top, bottom]
}

const PipeTop = (x: number, h: number) => LineWall({
  points: [
    x, -200,
    x, -200 + h,
    x + 100, -200 + h,
    x + 100, -200
  ],
  visible: true,
  sensor
})

const PipeBottom = (x: number, h: number) => LineWall({
  points: [
    x, 200,
    x, 200 - h,
    x + 100, 200 - h,
    x + 100, 200
  ],
  visible: true,
  sensor
})

const Floor = () => LineWall({ points: [-1000, 200, 10000, 200], sensor, visible: true })
const Ceiling = () => LineWall({ points: [-1000, -200, 10000, -200], sensor, visible: true })

export const FlappyCharacter = (player: Noob, color?: number, pos?: XY) => {
  const flappy: Character = Entity({
    id: `flappy-${player.id}`,
    components: {
      debug: Debug(),
      position: Position({ x: pos?.x ?? 32, y: pos?.y ?? 0, velocity: { x: 100, y: 0 }, gravity: 5 }),
      networked: Networked({ isNetworked: true }),
      collider: Collider({ shape: "ball", radius: 8, mass: 600, hittable: true }),
      health: Health({ health: 100 }),
      team: player.components.team,
      element: Element("flesh"),
      input: Input({
        press: {
          " ": (params) => ({ actionId: "jump", params })
        }
      }),
      actions: Actions<any>({
        point: Point,
        jump: Jump
      }),
      effects: Effects(),
      renderable: Renderable({
        anchor: { x: 0.5, y: 0.7 },
        scale: 2,
        zIndex: 3,
        interpolate: true,
        scaleMode: "nearest",
        animationColor: color ?? 0xffffff,
        setup: async (r) => {
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
  return flappy
}

const FlappySystem: SystemBuilder<"FlappySystem"> = {
  id: "FlappySystem",
  init: (world) => {
    let location = 0
    let furthest = 0

    const pipes: Set<Entity<Position | Renderable | Collider>> = new Set()

    return {
      id: "FlappySystem",
      query: ["player"],
      onTick: (players: Entity<Player>[]) => {
        let pc = undefined
        for (const player of players) {
          const character = player.components.controlling?.getControlledEntity(world)
          if (character?.components.position) pc = character.components.position
        }

        if (pc) {
          // reset pipes if player goes back
          if (location > pc.data.x) {
            for (const pipe of pipes) {
              world.removeEntity(pipe.id)
            }
            pipes.clear()
            furthest = 0
          }

          location = pc.data.x

          for (const pipe of pipes) {
            const { position } = pipe.components
            if (pc.data.x - position.data.x > 500) {
              pipes.delete(pipe)
              world.removeEntity(pipe.id)
            }
          }

          while (pipes.size < 8) {
            const x = furthest + randomInt(200) + 200
            furthest = max(furthest, x)

            const pipePair = PipePair(x)
            pipes.add(pipePair[0]).add(pipePair[1])
            world.addEntities(pipePair)
          }
        }
      }
    }
  }
}
