import {
  Background, CameraSystem, Cursor, EscapeMenu, GameBuilder,
  Position, ShadowSystem, SpawnSystem, SystemBuilder
} from "@piggo-gg/core"
import { Ball, Bot, Court, Dude, Net, TargetSystem } from "./entities"

export const Volleyball: GameBuilder = {
  id: "volleyball",
  init: () => ({
    id: "volleyball",
    netcode: "rollback",
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

type VolleyballData = {
  scoreLeft: number
  scoreRight: number
  phase: "serve" | "play" | "win"
  teamServing: "left" | "right"
  lastHit: string
}

const VolleyballSystem = SystemBuilder({
  id: "VolleyballSystem",
  init: (world) => {

    const data: VolleyballData = {
      scoreLeft: 0,
      scoreRight: 0,
      phase: "serve",
      teamServing: "left",
      lastHit: ""
    }

    return {
      id: "VolleyballSystem",
      query: [],
      data,
      priority: 5,
      onTick: () => {
        const ball = world.entity<Position>("ball")
        if (!ball) return

        const { x, y, z, velocity, standing } = ball.components.position.data

        if (data.phase === "serve") {
          if (z > 0) {
            data.phase = "play"
          } else {
            const x = data.teamServing === "left" ? 50 : 400
            ball.components.position.setPosition({ x, y: 0 }).setVelocity({ x: 0, y: 0 })
          }
        }

        if (x < -100 || x > 600) {
          ball.components.position.setPosition({ x: 225, y: 0 }).setVelocity({ x: 0, y: 0 })
          // ball.components.position.data.velocity.x = -velocity.x
        }
      }
    }
  }
})
