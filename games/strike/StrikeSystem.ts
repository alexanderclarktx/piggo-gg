import { Controlling, Player, Skelly, SystemBuilder, TeamNumber, World, XY } from "@piggo-gg/core"

type GameStates = "warmup" | "pre-round" | "round" | "planted" | "post-round" | "game-over"

const TeamSpawns: Record<TeamNumber, XY> = {
  1: { x: -1050, y: 1850 },
  2: { x: 1100, y: 700 }
}

export const StrikeSystem: SystemBuilder<"StrikeSystem"> = {
  id: "StrikeSystem",
  init: (world) => {

    let state: GameStates = "warmup"
    const spawnedPlayers: Set<string> = new Set()

    GameStateHooks[state].onStart(world)

    return {
      id: "StrikeSystem",
      query: ["pc"],
      priority: 5, // todo
      onTick: (players: Player[]) => {

        // despawn disconnected players
        spawnedPlayers.forEach((playerId) => {
          if (!world.entities[playerId]) {
            world.removeEntity(`skelly-${playerId}`)
            spawnedPlayers.delete(playerId)
          }
        })

        // despawn dead players
        spawnedPlayers.forEach((playerId) => {
          if (!world.entities[`skelly-${playerId}`]) spawnedPlayers.delete(playerId)
        })

        players.forEach((player) => {

          const { team, controlling } = player.components

          if (spawnedPlayers.has(player.id)) return

          // player not controlling a character
          if (!controlling.data.entityId || !spawnedPlayers.has(player.id)) {
            const character = Skelly(player, TeamSpawns[team.data.team])
            player.components.controlling = Controlling({ entityId: character.id })
            world.addEntity(character)
            spawnedPlayers.add(player.id)
          }
        })
      }
    }
  }
}

type Hooks = {
  onStart: (world: World) => void
  onTick: (world: World) => void
  timer: number
}

const GameStateHooks: Record<GameStates, Hooks> = {
  "warmup": {
    onStart: (world) => {
      // world.announce("warmup started")
    },
    onTick: (world) => { },
    timer: -1
  },
  "pre-round": {
    onStart: (world) => {
      world.announce("pre-round started")
    },
    onTick: (world) => { },
    timer: 10
  },
  "round": {
    onStart: (world) => {
      world.announce("round started")
    },
    onTick: (world) => { },
    timer: 120
  },
  "planted": {
    onStart: (world) => {
      world.announce("spike planted")
    },
    onTick: (world) => { },
    timer: 40
  },
  "post-round": {
    onStart: (world) => {
      world.announce("post-round started")
    },
    onTick: (world) => { },
    timer: 10
  },
  "game-over": {
    onStart: (world) => {
      world.announce("game over")
    },
    onTick: (world) => { },
    timer: 10
  },
}
