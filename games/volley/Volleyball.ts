import {
  Background, CameraSystem, Cursor, EscapeMenu, GameBuilder, LagText, Position,
  Scoreboard, ScorePanel, ShadowSystem, SpawnSystem, SystemBuilder, Team
} from "@piggo-gg/core"
import { Ball, Bot, Court, Dude, Net, TargetSystem } from "./entities"

export type VolleyballState = {
  scoreLeft: number
  scoreRight: number
  phase: "serve" | "play" | "win"
  teamServing: 1 | 2
  lastHit: string
  lastHitTeam: 0 | 1 | 2
  lastHitTick: number
  hit: 0 | 1 | 2 | 3
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
      teamServing: 1,
      lastHit: "",
      lastHitTeam: 1,
      lastHitTick: 0,
      hit: 0
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
      ScorePanel(),
      Scoreboard(),
      LagText({ y: 5 })
    ]
  })
}

const VolleyballSystem = SystemBuilder({
  id: "VolleyballSystem",
  init: (world) => {

    const bots = []

    // spawn bots
    const players = world.queryEntities<Team>(["pc", "team"])
    if (players.length < 4) {

      let team1 = 0
      let team2 = 0

      for (const player of players) {
        if (player.components.team.data.team === 1) team1++
        if (player.components.team.data.team === 2) team2++
      }

      while (team1 < 2) {
        bots.push(Bot(1, { x: 100, y: -30 + 30 * team1 }))
        team1++
      }

      while (team2 < 2) {
        bots.push(Bot(2, { x: 350, y: -30 + 30 * team2 }))
        team2++
      }

      for (const bot of bots) {
        world.addEntity(bot)
      }
    }

    // scale camera to fit the court
    const desiredScale = world.renderer?.app.screen.width! / 500
    const scaleBy = desiredScale - world.renderer?.camera.root.scale.x! - desiredScale * 0.1
    world.renderer?.camera.scaleBy(scaleBy)

    return {
      id: "VolleyballSystem",
      query: [],
      priority: 9,
      onTick: () => {
        const ballPos = world.entity<Position>("ball")?.components.position
        if (!ballPos) return

        const state = world.game.state as VolleyballState

        if (state.phase === "serve") {
          ballPos.setVelocity({ x: 0, y: 0 }).setPosition({
            x: state.teamServing === 1 ? 10 : 400,
            y: 1, z: 50
          }).setRotation(0).setGravity(0)

          state.lastHit = ""
          state.lastHitTeam = 0
        }

        if (state.phase === "play") {
          if (ballPos.data.z === 0) {

            state.phase = "serve"
            state.hit = 0
            state.lastHit = ""
            state.lastHitTeam = 0

            // who won the point
            if (ballPos.data.x < 225) {
              state.scoreRight++
              state.teamServing = 2
            } else {
              state.scoreLeft++
              state.teamServing = 1
            }
          }
        }
      }
    }
  }
})
