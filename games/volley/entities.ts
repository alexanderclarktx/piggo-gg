import {
  Action, Actions, Character, Collider, Debug, Entity, Input, LineWall,
  loadTexture, Move, Networked, NPC, pixiGraphics, Player, Position,
  Renderable, Shadow, sign, sqrt, Team, WASDInputMap, XYZdiff,
  DudeSkin, Ghost, VolleyCharacterAnimations, VolleyCharacterDynamic,
  Skins
} from "@piggo-gg/core"
import { Texture } from "pixi.js"
import { range, VolleyState } from "./Volley"
import { Spike } from "./Spike"

export const Dude = (player: Player) => Character({
  id: `dude-${player.id}`,
  components: {
    debug: Debug(),
    position: Position({
      y: 0, x: player.components.team.data.team === 1 ? 0 : 400,
      velocityResets: 1, speed: 125, gravity: 0.3
    }),
    networked: Networked(),
    collider: Collider({ shape: "ball", radius: 4, group: "notself" }),
    team: Team(player.components.team.data.team),
    input: Input({
      press: {
        ...WASDInputMap.press,
        " ": () => ({ actionId: "jump" }),
        "mb1": ({ hold, mouse, world, entity }) => {
          if (hold) return null
          const { position } = entity.components
          if (!position) return null

          const from = { x: position.data.x, y: position.data.y, z: position.data.z }
          const target = { x: mouse.x, y: mouse.y }
          world.actions.push(world.tick + 3, entity.id, { actionId: "spike", params: { from, target } })

          return null
        }
      }
    }),
    actions: Actions({
      move: Move,
      spike: Spike(),
      jump: Action("jump", ({ entity }) => {
        if (!entity?.components?.position?.data.standing) return
        entity.components.position.setVelocity({ z: 6 })
      })
    }),
    shadow: Shadow(5),
    renderable: Renderable({
      anchor: { x: 0.55, y: 0.9 },
      scale: 1.2,
      zIndex: 4,
      interpolate: true,
      scaleMode: "nearest",
      skin: (player.components.pc.data.name.startsWith("noob")) ? "dude-white" : "ghost", 
      setup: async (r) => {
        await Skins[r.skin.desired ?? "dude-white"](r)
      },
      animationSelect: VolleyCharacterAnimations,
      dynamic: VolleyCharacterDynamic
    })
  }
})

export const Ball = () => Entity({
  id: "ball",
  components: {
    debug: Debug(),
    position: Position({ x: 225, y: 0, gravity: 0.05 }),
    collider: Collider({ shape: "ball", radius: 4, restitution: 0.8 }),
    shadow: Shadow(3, 3),
    networked: Networked(),
    npc: NPC({
      behavior: (ball: Entity<Position | NPC | Collider>) => {
        const { position, collider } = ball.components

        const { x, y } = position.data.velocity
        position.data.rotation += 0.001 * sqrt((x * x + y * y)) * sign(x)

        if (position.data.z < 25) {
          collider.setGroup("two")
        } else {
          collider.setGroup("three")
        }
      }
    }),
    renderable: Renderable({
      zIndex: 4,
      anchor: { x: 0.5, y: 0.5 },
      interpolate: true,
      scaleMode: "nearest",
      rotates: true,
      dynamic: ({ entity: ball, world }) => {
        const { position: ballPos } = ball.components
        const { position, actions } = world.client?.playerCharacter()?.components ?? {}
        if (!position || !actions) return

        const far = XYZdiff(position.data, ballPos.data, range)

        if (!far) {
          ball.components.renderable.setOutline({ color: 0x55ff00, thickness: 2 })
        } else {
          ball.components.renderable.setOutline({ color: 0x000000, thickness: 0 })
        }
      },
      setup: async (r) => {
        r.setBevel({ lightAlpha: 0.5 })

        const texture = (await loadTexture("vball.json"))["ball"] as Texture
        texture.source.scaleMode = "nearest"

        r.c = pixiGraphics().circle(0, 0, 5).fill({ texture })
      }
    })
  }
})

// todo need a wider hitbox for the players
export const Centerline = () => Entity({
  id: "centerline",
  components: {
    position: Position({ x: 225 }),
    collider: Collider({ shape: "cuboid", length: 12, width: 75, isStatic: true })
  }
})

export const Court = () => LineWall({
  position: { x: 0, y: -75 },
  points: [
    0, 0,
    450, 0,
    500, 150,
    -50, 150,
    0, 0,
    5, 0
  ],
  visible: true,
  fill: 0x0066aa,
  strokeAlpha: 0.95
})

export const Bounds = (group: "two" | "three") => LineWall({
  id: `bounds-${group}`,
  position: { x: 225, y: -84 },
  group,
  points: [
    0, 0,
    -234, 0,
    -289, 168,
    289, 168,
    234, 0,
    0, 0
  ],
  sensor: (e2, world) => {
    if (e2.id !== "ball") return false
    if (e2.components.position.data.z === 0) return false

    const state = world.game.state as VolleyState
    state.phase = "point"
    state.lastWin = state.lastHitTeam === 1 ? 2 : 1

    return true
  }
})

export const PostTop = () => Entity({
  id: "post-top",
  components: {
    position: Position({ x: 225, y: -76, z: 25 }),
    renderable: Renderable({
      zIndex: 3.2,
      setup: async (renderable) => {
        renderable.setBevel()
        renderable.c = pixiGraphics().roundRect(-3, 0, 6, 28, 2).fill({ color: 0x943126, alpha: 1 })
      }
    })
  }
})

export const PostBottom = () => Entity({
  id: "post-bottom",
  components: {
    position: Position({ x: 225, y: 74, z: 25 }),
    renderable: Renderable({
      zIndex: 3.9,
      setup: async (renderable) => {
        renderable.setBevel()
        renderable.c = pixiGraphics().roundRect(-3, 0, 6, 28, 2).fill({ color: 0x943126, alpha: 1 })
      }
    })
  }
})

export const Net = () => Entity({
  id: "net",
  components: {
    position: Position({ x: 225, z: 25 }),
    collider: Collider({ shape: "line", points: [0, -75, 0, 75], isStatic: true, group: "two" }),
    renderable: Renderable({
      zIndex: 3.8,
      setup: async (renderable) => {
        renderable.setBevel()
        renderable.c = pixiGraphics().roundRect(-1, -75, 2, 150, 1).fill({ color: 0xffe47a, alpha: 1 })
      }
    })
  }
})
