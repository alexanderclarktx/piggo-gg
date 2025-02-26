import {
  Action, Actions, Background, CameraSystem, Character, ClientSystemBuilder, Collider, Cursor,
  Debug, Entity, EscapeMenu, GameBuilder, Input, LineWall, loadTexture, Move, Networked,
  pixiGraphics, Player, Point, Position, Renderable, SpawnSystem, WASDInputMap
} from "@piggo-gg/core"
import { AnimatedSprite, Sprite } from "pixi.js"

export const Volley: GameBuilder = {
  id: "volley",
  init: () => ({
    id: "volley",
    systems: [SpawnSystem(Dude), ShadowSystem, CameraSystem({ follow: () => ({ x: 225, y: 0 }) })],
    bgColor: 0x006633,
    entities: [Court(), Net(), Background({ img: "space.png" }), EscapeMenu(), Cursor()]
  })
}

const Dude = (player: Player) => Character({
  id: `dude-${player.id}`,
  components: {
    debug: Debug(),
    position: Position({ x: 0, y: 0, velocityResets: 1, speed: 120, gravity: 0.5 }),
    networked: Networked(),
    collider: Collider({ shape: "ball", radius: 4 }),
    team: player.components.team,
    input: Input({
      press: {
        ...WASDInputMap.press,
        " ": () => ({ actionId: "jump" })
      }
    }),
    actions: Actions({
      move: Move,
      point: Point,
      jump: Action("jump", ({ entity }) => {
        if (!entity?.components?.position?.data.standing) return
        entity.components.position.setVelocity({ z: 8 })
      }, 10)
    }),
    renderable: Renderable({
      anchor: { x: 0.5, y: 0.8 },
      scale: 2,
      zIndex: 4,
      interpolate: true,
      scaleMode: "nearest",
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

const Net = () => LineWall({
  position: { x: 225, y: -75 },
  points: [
    0, 0,
    0, 150
  ],
  visible: true
})

const Court = () => LineWall({
  position: { x: 0, y: -75 },
  points: [
    0, 0,
    450, 0,
    500, 150,
    -50, 150,
    0, 0
  ],
  visible: true,
  fill: 0x0066aa
})

const Shadow = (character: Entity<Position>) => Entity<Renderable>({
  id: `shadow-${character.id}`,
  components: {
    position: Position(),
    renderable: Renderable({
      zIndex: 3.9,
      interpolate: true,
      dynamic: ({ entity }) => {
        const { position } = entity.components
        if (!position) return

        position.data.x = character.components.position.data.x
        position.data.y = character.components.position.data.y
        position.setVelocity({ x: character.components.position.data.velocity.x, y: character.components.position.data.velocity.y })

        position.lastCollided = character.components.position.lastCollided
      },
      setContainer: async () => {
        const g = pixiGraphics()
        g.ellipse(0, 1, 10, 5)
        g.fill({ color: 0x000000, alpha: 0.3 })
        return g
      }
    })
  }
})

const Ball = () => Entity({
  id: "ball",
  components: {
    position: Position({ x: 225, y: 0, gravity: 0.5 }),
    renderable: Renderable({
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.7,
      zIndex: 4,
      interpolate: true,
      scaleMode: "nearest",
      dynamic: ({ entity }) => {
        const { position } = entity.components
        if (!position) return

        if (position.data.standing) {
          position.setVelocity({ z: 10 })
        }
      },
      setup: async (r) => {
        const texture = (await loadTexture("ball.json"))["ball"]
        const sprite = new Sprite(texture)

        sprite.anchor.set(0.5, 0.5)

        r.c = sprite
      }
    })
  }
})

const ShadowSystem = ClientSystemBuilder({
  id: "ShadowSystem",
  init: (world) => {

    const shadows: Record<string, Entity<Renderable>> = {}

    return {
      id: "ShadowSystem",
      query: ["pc"],
      onTick: (entities: Player[]) => {
        entities.forEach((entity) => {
          const { controlling } = entity.components

          const character = controlling.getControlledEntity(world)
          if (!character) return

          if (!shadows[character.id]) {
            const shadow = Shadow(character)
            shadows[character.id] = shadow
            world.addEntity(shadow)
          }
        })
      }
    }
  }
})
