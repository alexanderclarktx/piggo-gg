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

const VolleyballSystem = SystemBuilder({
  id: "VolleyballSystem",
  init: (world) => {
    return {
      id: "VolleyballSystem",
      query: [],
      priority: 5,
      onTick: () => {
        const ball = world.entity<Position>("ball")
        if (!ball) return

        const { x, y, z, velocity } = ball.components.position.data

        if (x < -100 || x > 600) {
          ball.components.position.setPosition({ x: 225, y: 0 }).setVelocity({ x: 0, y: 0 })
          // ball.components.position.data.velocity.x = -velocity.x
        }
      }
    }
  }
})
