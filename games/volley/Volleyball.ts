import {
  Background, CameraSystem, Cursor, EscapeMenu, GameBuilder,
  Position, ShadowSystem, SpawnSystem, SystemBuilder
} from "@piggo-gg/core"
import { Ball, Bot, Court, Dude, Net, TargetSystem } from "./entities"

type VolleyballState = {
  scoreLeft: number
  scoreRight: number
  phase: "serve" | "play" | "win"
  teamServing: "left" | "right"
  lastHit: string
}

export const Volleyball: GameBuilder<VolleyballState> = {
  id: "volleyball",
  init: () => ({
    id: "volleyball",
    netcode: "rollback",
    state: {
      scoreLeft: 0,
      scoreRight: 0,
      phase: "serve",
      teamServing: "left",
      lastHit: ""
    },
    systems: [
      SpawnSystem(Dude),
      VolleyballSystem,
      ShadowSystem,
      TargetSystem,
      CameraSystem({ follow: () => ({ x: 225, y: 0 }) })
    ],
    bgColor: 0x006633,
    entities: [
      Background({ img: "space.png" }),
      EscapeMenu(), Cursor(),
      Ball(),
      Court(),
      Net(),
      Bot()
    ]
  })
}

const VolleyballSystem = SystemBuilder({
  id: "VolleyballSystem",
  init: (world) => {

    return {
      id: "VolleyballSystem",
      query: [],
      priority: 5,
      onTick: () => {
        const ballPos = world.entity<Position>("ball")?.components.position
        if (!ballPos) return

        const state = world.game.state as VolleyballState

        if (state.phase === "serve") {
          if (ballPos.data.z > 0) {
            state.phase = "play"
          } else {
            const x = state.teamServing === "left" ? 0 : 400
            ballPos.setPosition({ x, y: 0 }).setVelocity({ x: 0, y: 0 })
          }
        }

        if (state.phase === "play") {
          if (ballPos.data.z === 0) {
            const x = state.teamServing === "left" ? 0 : 400
            ballPos.setPosition({ x, y: 0 }).setVelocity({ x: 0, y: 0 })
          }
        }

        // if (x < -100 || x > 600) {
          // ball.components.position.setPosition({ x: 225, y: 0 }).setVelocity({ x: 0, y: 0 })
          // ball.components.position.data.velocity.x = -velocity.x
        // }
      }
    }
  }
})
