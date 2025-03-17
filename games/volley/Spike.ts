import { Action, velocityToDirection, velocityToPoint, XY, XYdistance, XYZ, XYZdiff, Position } from "@piggo-gg/core"
import { range, VolleyballState } from "./Volleyball"

export const Spike = Action<{ target: XY, from: XYZ }>("spike", ({ world, params, entity }) => {
  if (!params.target || !params.from || !entity) return

  const ball = world.entity<Position>("ball")
  if (!ball) return

  const { target, from } = params
  const { position: ballPos } = ball.components

  const standing = from.z === 0
  const far = XYZdiff(from, ballPos.data, range)

  const team = entity.components.team!.data.team

  if (!far) {
    const state = world.game.state as VolleyballState

    // can't hit if point is over
    if (state.phase === "point") return

    // no 4th hits
    if (state.hit === 3 && state.lastHitTeam === team) {
      return
    }

    // no hit from same team on serve
    if (state.phase === "serve" && state.lastHitTeam === team) {
      return
    }

    // no spike on serve
    if (state.phase === "serve" && state.hit === 1 && from.z > 0) {
      return
    }

    world.client?.soundManager.play("spike")

    state.lastHit = entity.id
    if (state.lastHitTeam != team) {
      state.lastHitTeam = team
      state.hit = 1
    } else {
      state.hit += 1
    }

    state.lastHitTick = world.tick
    ballPos.setPosition({ z: ballPos.data.z + 0.1 })

    if (state.phase === "serve" && state.hit === 1 && state.teamServing === team) {
      ballPos.setVelocity({ z: 0.5 }).setGravity(0.05)
      const v = velocityToPoint(ballPos.data, target, 0.05, 0.5)
      ballPos.setVelocity({ x: v.x / 25 * 1000, y: v.y / 25 * 1000 })
      return // don't set phase to play
    } else if (standing) {
      ballPos.setVelocity({ z: 3.2 }).setGravity(0.1)

      const v = velocityToDirection(ballPos.data, target, 70, 0.07, 3.2)
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
