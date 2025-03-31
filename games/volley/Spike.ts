import { Action, velocityToDirection, velocityToPoint, XY, XYdistance, XYZ, XYZdiff, Position } from "@piggo-gg/core"
import { range, VolleyState } from "./Volley"

export const Spike = () => Action<{ target: XY, from: XYZ }>("spike", ({ world, params, entity }) => {
  if (!params.target || !params.from || !entity) return

  const ball = world.entity<Position>("ball")
  if (!ball) return

  const { target, from } = params
  const { position: ballPos } = ball.components

  const standing = from.z === 0
  const far = XYZdiff(from, ballPos.data, range)

  const team = entity.components.team!.data.team

  if (!far) {
    const state = world.game.state as VolleyState

    // can't hit if point is over
    if (state.phase === "point") return

    // no 4th hits
    if (state.hit === 3 && state.lastHitTeam === team) {
      return
    }

    // no double hits
    if (state.lastHit === entity.id) {
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

    // no back-to-back quick hits (double receive)
    if (10 > world.tick - state.lastHitTick) {
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

    let g = 1
    let vz = 100
    let v = { x: 0, y: 0 }

    const targetOnOtherSide = team === 1 ? target.x > 225 : target.x < 225

    const distance = XYdistance(from, target)

    if (state.phase === "serve" && state.hit === 1 && state.teamServing === team) {
      g = 0.08
      vz = 1 + distance / 600
      v = velocityToPoint(ballPos.data, target, g, vz)
    } else if (standing && state.hit === 3) {
      g = 0.1
      vz = 3.2
      v = velocityToPoint(ballPos.data, target, g, vz)

      state.phase = "play"

    } else if (standing) {
      g = 0.1
      vz = 3.2
      v = velocityToDirection(ballPos.data, target, 80, g, vz)

      state.phase = "play"
    } else if (!targetOnOtherSide && state.hit === 2) {
      g = 0.1
      vz = 2
      v = velocityToPoint(ballPos.data, target, g, vz)

      state.phase = "play"
    } else {
      vz = -3 + distance / 140

      if (ballPos.data.z < 70) {
        vz -= (ballPos.data.z - 70) / 20
      }

      g = 0.05
      v = velocityToPoint(ballPos.data, target, g, vz)

      state.phase = "play"
    }

    ballPos.setGravity(g).setVelocity({ z: vz, x: v.x / 25 * 1000, y: v.y / 25 * 1000 })
  }
}, 10)
