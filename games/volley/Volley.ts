import {
  Background, CameraSystem, Cursor, Entity, EscapeMenu, GameBuilder, LagText, Position,
  ScorePanel, ShadowSystem, SpawnSystem, SystemBuilder, Team, switchTeamButton, values
} from "@piggo-gg/core"
import { Ball, Court, Dude, Centerline, Net, PostTop, PostBottom, Bounds } from "./entities"
import { Bot } from "./Bot"
import { TargetSystem } from "./Target"

export const range = 30

export type VolleyState = {
  scoreLeft: number
  scoreRight: number
  phase: "serve" | "play" | "point" | "game"
  teamServing: 1 | 2
  lastHit: string
  lastHitTeam: 0 | 1 | 2
  lastHitTick: number
  lastWin: 0 | 1 | 2
  hit: 0 | 1 | 2 | 3 | 4
}

export const Volley: GameBuilder<VolleyState> = {
  id: "volley",
  init: () => ({
    id: "volley",
    netcode: "rollback",
    state: {
      scoreLeft: 0,
      scoreRight: 0,
      phase: "point",
      teamServing: 1,
      lastHit: "",
      lastHitTeam: 0,
      lastHitTick: 0,
      lastWin: 0,
      hit: 0
    },
    systems: [
      SpawnSystem(Dude),
      VolleySystem,
      ShadowSystem,
      TargetSystem,
      CameraSystem({ follow: () => ({ x: 225, y: 0 }) })
    ],
    entities: [
      Background({ rays: true }),
      EscapeMenu(), Cursor(),
      Ball(),
      Court(),
      Centerline(),
      PostTop(),
      PostBottom(),
      Net(),
      Bounds("two"),
      Bounds("three"),
      ScorePanel(),
      LagText({ y: 5 }),
      switchTeamButton()
    ]
  })
}

const VolleySystem = SystemBuilder({
  id: "VolleySystem",
  init: (world) => {

    const bots: Record<string, Entity<Position | Team>> = {}

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
        const bot = Bot(1, { x: 100, y: -30 + 30 * team1 })
        bots[bot.id] = bot
        team1++
      }

      while (team2 < 2) {
        const bot = Bot(2, { x: 350, y: -30 + 30 * team2 })
        bots[bot.id] = bot
        team2++
      }

      for (const bot of values(bots)) world.addEntity(bot)
    }

    // scale camera to fit the court
    const desiredScale = world.renderer?.app.screen.width! / 500
    const scaleBy = desiredScale - world.renderer?.camera.root.scale.x! - desiredScale * 0.1 - 0.2
    world.renderer?.camera.scaleBy(scaleBy)

    return {
      id: "VolleySystem",
      query: [],
      priority: 9,
      onTick: () => {
        const ballPos = world.entity<Position>("ball")?.components.position
        if (!ballPos) return

        const state = world.game.state as VolleyState

        if (state.phase === "point") {

          // wait for ball to land
          if (ballPos.data.z > 0) return

          // set score
          if (state.lastWin === 1) state.scoreLeft++
          if (state.lastWin === 2) state.scoreRight++
          state.teamServing = state.lastWin === 2 ? 2 : 1

          if (state.scoreLeft >= 7 || state.scoreRight >= 7) {
            state.scoreLeft = 0
            state.scoreRight = 0
          }

          // reset state
          state.phase = "serve"
          state.lastHit = ""
          state.lastHitTeam = 0
          state.hit = 0

          // reset ball
          ballPos.setVelocity({ x: 0, y: 0, z: 0 }).setRotation(0).setGravity(0)
          ballPos.setPosition({
            x: state.teamServing === 1 ? 10 : 400,
            y: 1, z: 50
          })
        }

        if (state.phase === "serve") {
          let team1 = 0
          let team2 = 0

          const characters = world.queryEntities<Position | Team>(["position", "team", "input"])
          for (const character of characters) {
            const { position, team } = character.components

            // move any characters if they're on the wrong side
            if (position.data.x < 225 && team.data.team === 2) {
              position.setPosition({ x: 300, y: position.data.y, z: position.data.z })
            } else if (position.data.x > 225 && team.data.team === 1) {
              position.setPosition({ x: 150, y: position.data.y, z: position.data.z })
            }

            if (team.data.team === 1) { team1++ } else { team2++ }
          }

          // adjust bots
          for (const bot of values(bots)) {
            const { team } = bot.components
            if (team.data.team === 1) {
              if (team1 >= 2) {
                world.removeEntity(bot.id)
                delete bots[bot.id]
              } else {
                team1++
              }
            } else {
              if (team2 >= 2) {
                world.removeEntity(bot.id)
                delete bots[bot.id]
              } else {
                team2++
              }
            }
          }

          // spawn new bots
          while (team1 < 2) {
            team1++
            const bot = Bot(1, { x: 100, y: -30 + 30 * team1 })
            bots[bot.id] = bot
            world.addEntity(bot)
          }

          while (team2 < 2) {
            team2++
            const bot = Bot(2, { x: 350, y: -30 + 30 * team2 })
            bots[bot.id] = bot
            world.addEntity(bot)
          }
        }

        if (state.phase === "play" || state.phase === "serve") {
          if (ballPos.data.z === 0) {
            state.phase = "point"
            state.lastWin = (ballPos.data.x < 225) ? 2 : 1
          }
        }
      }
    }
  }
})
