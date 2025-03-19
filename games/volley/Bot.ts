import {
  Action, Actions, Chase, closestEntity, Collider, Debug, Entity, loadTexture,
  middle, Move, Networked, NPC, Position, Renderable, Shadow, Team,
  TeamColors, teammates, TeamNumber, XY, XYdiff, XYZdiff
} from "@piggo-gg/core"
import { Spike } from "./Spike"
import { range, VolleyballState } from "./Volleyball"
import { AnimatedSprite } from "pixi.js"

export const Bot = (team: TeamNumber, pos: XY): Entity<Position> => {
  const bot: Entity<Position | Team> = Entity({
    id: `bot-${team}-${pos.x}-${pos.y}`,
    components: {
      debug: Debug(),
      position: Position({ ...pos, velocityResets: 1, speed: 120, gravity: 0.3 }),
      networked: Networked(),
      collider: Collider({ shape: "ball", radius: 4, group: "notself" }),
      team: Team(team),
      actions: Actions({
        move: Move,
        spike: Spike(),
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
          const { position } = bot.components
          const { position: targetPos } = target.components
          const team = bot.components.team.data.team

          const state = world.game.state as VolleyballState

          if (state.phase === "serve") {
            // if our team not serving
            if (state.teamServing !== team && state.hit === 0) {
              position.clearHeading()
              return
            }

            // if teammate just served
            if (state.hit === 1 && state.lastHitTeam === team) {
              position.clearHeading()
              return
            }

            // if we're not the closest to the ball
            if (state.hit === 0 && closestEntity(ballPos.data, teammates(world, bot))?.id !== bot.id) {
              position.clearHeading()
              return
            }

            // if we're not the closest to the target
            if (state.hit === 1 && closestEntity(targetPos.data, teammates(world, bot))?.id !== bot.id) {
              position.clearHeading()
              return
            }
          } else {
            // if ball is going to the other side
            if ((team === 1 && targetPos.data.x > 225) || (team === 2 && targetPos.data.x < 225)) {
              position.clearHeading()
              return
            }
          }

          // if we just hit the ball
          if (state.lastHit === bot.id) {
            position.clearHeading()
            return
          }

          // if we are not the closest to the target
          const closest = closestEntity(targetPos.data, teammates(world, bot))
          if (state.phase !== "serve" && closest?.id !== state.lastHit && closest?.id !== bot.id) {
            position.clearHeading()
            return
          }

          // jump for 3rd hit
          if (state.hit === 2 && state.lastHitTeam === team && position.data.standing && world.tick - state.lastHitTick > 20) {
            return { actionId: "jump", entityId: bot.id }
          }

          const far = XYZdiff(position.data, ballPos.data, range)

          if (far) {
            // jump for the serve
            if (state.phase === "serve" && position.data.standing && !XYdiff(position.data, ballPos.data, 20)) {
              return { actionId: "jump", entityId: bot.id }
            }

            // chase the ball or target
            const ballOrTarget = (state.phase === "serve" && state.hit === 0) ? ball.id : target.id
            return { actionId: "chase", entityId: bot.id, params: { target: ballOrTarget } }
          } else {
            if (world.tick - state.lastHitTick < 20) return

            const from = { x: position.data.x, y: position.data.y, z: position.data.z }

            // spike
            if (state.hit === 2 || (state.phase === "serve" && state.hit === 0)) {
              const target = {
                x: 225 + (team === 1 ? 1 : -1) * world.random.int(225),
                y: world.random.int(150, 75)
              }
              return { actionId: "spike", entityId: bot.id, params: { target, from } }
            }

            // don't bump if ball on other side
            if ((team === 2 && ballPos.data.x < 225) || (team === 1 && ballPos.data.x > 225)) {
              return
            }

            const closestTeammate = teammates(world, bot).filter((x) => x.id !== bot.id)[0]
            if (!closestTeammate) return

            // bump
            const hit = middle(
              closestTeammate.components.position.data,
              { y: closestTeammate.components.position.data.y, x: 225 }
            )
            return { actionId: "spike", entityId: bot.id, params: { target: hit, from } }
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
