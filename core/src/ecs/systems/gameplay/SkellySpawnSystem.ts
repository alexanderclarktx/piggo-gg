import { Noob, spawnSkelly, SystemBuilder } from "@piggo-gg/core"

// spawn characters for players
export const SkellySpawnSystem: SystemBuilder<"SkellySpawnSystem"> = {
  id: "SkellySpawnSystem",
  init: (world) => {

    const spawnedPlayers: Set<string> = new Set()

    return {
      id: "SkellySpawnSystem",
      query: ["player"],
      onTick: (players: Noob[]) => {

        // cleanup
        spawnedPlayers.forEach((playerId) => {
          if (!world.entities[playerId]) {
            world.removeEntity(`skelly-${playerId}`)
            spawnedPlayers.delete(playerId)
          }
        })

        // spawn skellies
        players.forEach((player) => {

          // if player is not controlling a character
          if (!player.components.controlling.data.entityId) {
            world.actionBuffer.push(world.tick + 1, player.id, spawnSkelly.prepare({ player }))
            spawnedPlayers.add(player.id)
          }

          // if it's a new player
          if (!spawnedPlayers.has(player.id)) {
            world.actionBuffer.push(world.tick + 1, player.id, spawnSkelly.prepare({ player }))
            spawnedPlayers.add(player.id)
          }
        })
      }
    }
  }
}
