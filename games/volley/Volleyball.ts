import {
  Background, CameraSystem, Cursor, EscapeMenu, GameBuilder,
  Position, ShadowSystem, SpawnSystem, SystemBuilder
} from "@piggo-gg/core"
import { Ball, Bot, Court, Dude, Net, TargetSystem } from "./entities"

export type VolleyballState = {
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
    entities: [
      Background({ img: "space.png" }),
      EscapeMenu(), Cursor(),
      Ball(),
      Court(),
      Net(),
      // Bot(1, { x: 100, y: 0 }),
      // Bot(2, { x: 350, y: 0 }),
      // Bot(2, { x: 350, y: 50 }),
    ]
  })
}

const VolleyballSystem = SystemBuilder({
  id: "VolleyballSystem",
  init: (world) => {

    // scale camera to fit the court
    const desiredScale = world.renderer?.app.screen.width! / 500
    const scaleBy = desiredScale - world.renderer?.camera.root.scale.x! - desiredScale * 0.1
    world.renderer?.camera.scaleBy(scaleBy)

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
            ballPos.setVelocity({ x: 0, y: 0 }).setPosition({
              y: 1,
              x: state.teamServing === "left" ? 5 : 5
            })

            ballPos.data.rotation = 0
          }
        }

        if (state.phase === "play") {
          if (ballPos.data.z === 0) {

            state.phase = "serve"

            // who won the point
            if (ballPos.data.x < 225) {
              state.scoreRight++
              state.teamServing = "right"
            } else {
              state.scoreLeft++
              state.teamServing = "left"
            }

            // world.announce(`${state.teamServing} team won the point!`)
          }
        }
      }
    }
  }
})
