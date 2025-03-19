import {
  Action, Actions, Character, Collider, Debug, Entity, Input, keys, LineWall,
  loadTexture, Move, Networked, NPC, pixiGraphics, Player, Position,
  Renderable, Shadow, sign, sqrt, Team, WASDInputMap, XYZdiff
} from "@piggo-gg/core"
import { AnimatedSprite, Texture } from "pixi.js"
import { range, VolleyballState } from "./Volleyball"
import { Spike } from "./Spike"

export const Dude = (player: Player) => Character({
  id: `dude-${player.id}`,
  components: {
    debug: Debug(),
    position: Position({
      y: 0, x: player.components.team.data.team === 1 ? 0 : 400,
      velocityResets: 1, speed: 120, gravity: 0.3
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
      animationSelect: (dude, world) => {
        const { position, renderable } = dude.components
        const actions = world.actions.atTick(world.tick)?.[dude.id]

        if (renderable.activeAnimation === "spike" && renderable.animation &&
          (renderable.animation.currentFrame + 1 !== renderable.animation.totalFrames)) {
          console.log("CONTINUE spike")
          return "spike"
        }

        if (actions?.find(a => a.actionId === "spike")) {
          console.log("spike", world.actions.atTick(world.tick)?.[dude.id])
          return "spike"
        }

        // if (position.data.velocity.z) {
        //   return "jump"
        // }

        if (position.data.velocity.x || position.data.velocity.y) {
          return "run"
        }

        return "idle"
      },
      scale: 1.2,
      zIndex: 4,
      interpolate: true,
      scaleMode: "nearest",
      dynamic: ({entity}) => {
        const { position, renderable } = entity.components

        if (position.data.velocity.x > 0) {
          renderable.setScale({ x: 1, y: 1 })
        } else if (position.data.velocity.x < 0) {
          renderable.setScale({ x: -1, y: 1 })
        }
      },
      setup: async (r) => {
        const t = await loadTexture("ghost.json")

        r.animations = {
          run: new AnimatedSprite([t["run1"], t["run2"], t["run4"], t["run5"]]),
          jump: new AnimatedSprite([t["jump3"], t["jump1"]]),
          idle: new AnimatedSprite([t["idle1"], t["idle2"], t["idle3"], t["idle4"]]),
          spike: new AnimatedSprite([t["spike3"], t["spike3"]])
        }
      }
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
      // scale: 0.22,
      // outline: { color: 0x222222, thickness: 1 },
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
        // const texture = (await loadTexture("piggo-logo.json"))["piggo-logo"]
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
  position: { x: 225, y: -80 },
  group,
  points: [
    0, 0,
    -230, 0,
    -285, 160,
    285, 160,
    230, 0,
    0, 0
  ],
  sensor: (e2, world) => {
    if (e2.id !== "ball") return false

    const state = world.game.state as VolleyballState
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
      setContainer: async () => {
        return pixiGraphics().roundRect(-3, 0, 6, 28, 2).fill({ color: 0x943126, alpha: 1 })
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
      setContainer: async () => {
        return pixiGraphics().roundRect(-3, 0, 6, 28, 2).fill({ color: 0x943126, alpha: 1 })
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
      setContainer: async () => {
        return pixiGraphics().roundRect(-1, -75, 2, 150, 1).fill({ color: 0xffe47a, alpha: 1 })
      }
    })
  }
})
