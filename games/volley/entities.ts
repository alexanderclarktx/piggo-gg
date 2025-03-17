import {
  Action, Actions, Character, Chase, closestEntity, Collider, Debug, Entity,
  Input, LineWall, loadTexture, middle, Move, Networked, NPC, pixiGraphics, Player,
  Position, Renderable, Shadow, sign, sqrt, SystemBuilder, Team, TeamColors,
  teammates, TeamNumber, timeToLand, velocityToDirection, velocityToPoint,
  WASDInputMap, XY, XYdiff, XYdistance, XYZ, XYZdiff
} from "@piggo-gg/core"
import { AnimatedSprite, Texture } from "pixi.js"
import { VolleyballState } from "./Volleyball"

const range = 35

export const Spike = Action<{ target: XY, from: XYZ }>("spike", ({ world, params, entity }) => {
  if (!params.target || !params.from || !entity) return

  const ball = world.entity<Position>("ball")
  if (!ball) return

  const { target, from } = params
  const { position: ballPos } = ball.components

  const standing = from.z === 0
  const far = XYZdiff(from, ballPos.data, range)

  if (!far) {
    const state = world.game.state as VolleyballState
    if (world.tick - state.lastHitTick < 20) return

    world.client?.soundManager.play("spike")

    state.lastHit = entity.id
    if (state.lastHitTeam != entity.components.team!.data.team) {
      state.lastHitTeam = entity.components.team!.data.team
      state.hit = 1
    } else {
      state.hit += 1
    }

    state.lastHitTick = world.tick
    ballPos.setPosition({ z: ballPos.data.z + 0.1 })

    if (state.phase === "serve" && state.hit === 1) {
      ballPos.setVelocity({ z: 0.5 }).setGravity(0.05)
      const v = velocityToPoint(ballPos.data, target, 0.05, 0.5)
      ballPos.setVelocity({ x: v.x / 25 * 1000, y: v.y / 25 * 1000 })
    } else if (standing) {
      ballPos.setVelocity({ z: 3.5 }).setGravity(0.1)

      const v = velocityToDirection(ballPos.data, target, 70, 0.07, 3)
      ballPos.setVelocity({ x: v.x / 25 * 1000, y: v.y / 25 * 1000 })
    } else {
      const distance = XYdistance(from, target)
      const vz = -2 + distance / 200

      ballPos.setVelocity({ z: vz }).setGravity(0.05)

      const v = velocityToPoint(ballPos.data, params.target, 0.05, vz)
      ballPos.setVelocity({ x: v.x / 25 * 1000, y: v.y / 25 * 1000 })
    }

    state.phase = "play"
  }
}, 20)

export const Bot = (team: TeamNumber, pos: XY): Entity<Position> => {
  const bot: Entity<Position | Team> = Entity({
    id: `bot-${team}-${pos.x}-${pos.y}`,
    components: {
      debug: Debug(),
      position: Position({ ...pos, velocityResets: 1, speed: 120, gravity: 0.3 }),
      networked: Networked(),
      collider: Collider({ shape: "ball", radius: 4, group: "11111111111111100000000000000001" }),
      team: Team(team),
      actions: Actions({
        move: Move,
        spike: Spike,
        chase: Chase,
        jump: Action("jump", ({ entity }) => {
          if (!entity?.components?.position?.data.standing) return
          entity.components.position.setVelocity({ z: 6 })
        })
      }),
      shadow: Shadow(5),
      npc: NPC({
        behavior: (_, world) => {
          const ball = world.entity<Position>("ball")
          const target = world.entity<Position>("target")
          if (!ball || !target) return

          const { position: ballPos } = ball.components
          const { position, team } = bot.components
          const { position: targetPos } = target.components

          const state = world.game.state as VolleyballState

          // if ball is going to the other side
          if (state.phase !== "serve" && (team.data.team === 1 && targetPos.data.x > 225) || (team.data.team === 2 && targetPos.data.x < 225)) {
            position.clearHeading()
            return
          }

          // if we just hit the ball
          if (state.lastHit === bot.id) {
            position.clearHeading()
            return
          }

          // if we are not serving
          if (state.phase === "serve" && state.teamServing !== team.data.team) {
            position.clearHeading()
            return
          }

          // if we are not the closest to the target
          const closest = closestEntity(targetPos.data, teammates(world, bot))
          if (state.phase !== "serve" && closest?.id !== state.lastHit && closest?.id !== bot.id) {
            position.clearHeading()
            return
          }

          // if we are not the closest to the ball while serving
          if (state.phase === "serve" && closestEntity(ballPos.data, teammates(world, bot))?.id !== bot.id) {
            position.clearHeading()
            return
          }

          // jump for the 3rd hit
          if (state.hit === 2 && state.lastHitTeam === team.data.team &&
            position.data.standing && world.tick - state.lastHitTick > 30
          ) {
            return { actionId: "jump", entityId: bot.id }
          }

          const far = XYZdiff(position.data, ballPos.data, range)

          if (!far) {
            const from = { x: position.data.x, y: position.data.y, z: position.data.z }

            if (state.hit === 2 || (state.phase === "serve" && state.hit === 0)) {
              const target = {
                x: 225 + (team.data.team === 1 ? 1 : -1) * world.random.int(225),
                y: world.random.int(150, 75)
              }
              return { actionId: "spike", entityId: bot.id, params: { target, from } }
            }

            const closestTeammate = teammates(world, bot).filter((x) => x.id !== bot.id)[0]
            if (!closestTeammate) return
            const hit = middle(
              closestTeammate.components.position.data,
              { y: closestTeammate.components.position.data.y, x: 225 }
            )

            return { actionId: "spike", entityId: bot.id, params: { target: hit, from } }
          } else {
            // jump for the serve
            if (state.phase === "serve" && position.data.standing && !XYdiff(position.data, ballPos.data, 20)) {
              return { actionId: "jump", entityId: bot.id }
            }

            const ballOrTarget = state.phase === "serve" ? ball.id : target.id
            return { actionId: "chase", entityId: bot.id, params: { target: ballOrTarget } }
          }
        },
      }),
      renderable: Renderable({
        anchor: { x: 0.5, y: 0.8 },
        scale: 2,
        zIndex: 4,
        interpolate: true,
        scaleMode: "nearest",
        color: TeamColors[team],
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
  return bot
}

export const Dude = (player: Player) => Character({
  id: `dude-${player.id}`,
  components: {
    debug: Debug(),
    position: Position({
      y: 0, x: player.components.team.data.team === 1 ? 0 : 400,
      velocityResets: 1, speed: 120, gravity: 0.3
    }),
    networked: Networked(),
    collider: Collider({ shape: "ball", radius: 4, group: "11111111111111100000000000000001" }),
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
      spike: Spike,
      jump: Action("jump", ({ entity }) => {
        if (!entity?.components?.position?.data.standing) return
        entity.components.position.setVelocity({ z: 6 })
      })
    }),
    shadow: Shadow(5),
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

export const Ball = () => Entity({
  id: "ball",
  components: {
    debug: Debug(),
    position: Position({ x: 225, y: 0, gravity: 0.05 }),
    collider: Collider({ shape: "ball", radius: 4, restitution: 0.8, group: "11111111111111100000000000000000" }),
    shadow: Shadow(3, 3),
    networked: Networked(),
    npc: NPC({
      behavior: (ball: Entity<Position | NPC | Collider>) => {
        const { position, collider } = ball.components

        const { x, y } = position.data.velocity
        position.data.rotation += 0.001 * sqrt((x * x + y * y)) * sign(x)

        if (position.data.z < 25) {
          collider.setGroup("11111111111111100000000000000001")
        } else {
          collider.setGroup("11111111111111100000000000000000")
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

export const Target = (ball: Entity<Position | Renderable>) => {

  let last: XY = { x: 0, y: 0 }

  const target = Entity<Renderable | Position>({
    id: "target",
    components: {
      position: Position(),
      networked: Networked(),
      npc: NPC({
        behavior: (_, world) => {
          const { z, x, y, velocity: v, gravity, standing } = ball.components.position.data

          if (v.x === last.x && v.y === last.y) return
          last = { x: v.x, y: v.y }

          const t = timeToLand(gravity, z, v.z)

          target.components.position.setPosition({
            x: x + v.x * t / 1000 * world.tickrate,
            y: y + v.y * t / 1000 * world.tickrate
          })

          target.components.renderable.visible = (!standing && gravity > 0)
        }
      }),
      renderable: Renderable({
        zIndex: 3.8,
        visible: false,
        setContainer: async () => {
          const g = pixiGraphics()
          g.ellipse(0, 0, 6, 3)
          g.stroke({ color: 0x00ffff, alpha: 0.9, width: 1.5 })

          return g
        }
      })
    }
  })
  return target
}

export const TargetSystem = SystemBuilder({
  id: "TargetSystem",
  init: ((world) => {

    let target: Entity<Renderable> | undefined = undefined

    return {
      id: "BallTargetSystem",
      query: [],
      priority: 5,
      onTick: () => {
        const ball = world.entity<Position | Renderable>("ball")

        if (ball) {
          if (!target || !world.entity("target")) {
            target = Target(ball)
            world.addEntity(target)
          }
        }
      }
    }
  })
})

// todo need a wider hitbox for the players
export const Centerline = () => LineWall({
  position: { x: 225, y: -75 },
  points: [
    0, 0,
    0, 150
  ],
  visible: true
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

export const PostTop = () => Entity({
  id: "post-top",
  components: {
    position: Position({ x: 225, y: 0, z: 25 }),
    renderable: Renderable({
      zIndex: 3.1,
      setContainer: async () => {
        const g = pixiGraphics()

        g.roundRect(-3, -76, 6, 27, 2)
        g.fill({ color: 0x943126, alpha: 1 })

        return g
      }
    })
  }
})

export const PostBottom = () => Entity({
  id: "post-bottom",
  components: {
    position: Position({ x: 225, y: 0, z: 25 }),
    renderable: Renderable({
      zIndex: 3.9,
      setContainer: async () => {
        const g = pixiGraphics()

        g.roundRect(-3, 74, 6, 28, 2)
        g.fill({ color: 0x943126, alpha: 1 })

        return g
      }
    })
  }
})

export const Net = () => Entity({
  id: "net",
  components: {
    position: Position({ x: 225, y: 0, z: 25 }),
    renderable: Renderable({
      zIndex: 3.8,
      setContainer: async () => {
        const g = pixiGraphics()

        // net
        g.roundRect(-1, -75, 2, 150, 1)
        g.fill({ color: 0xffe47a, alpha: 1 })
        return g
      }
    })
  }
})
