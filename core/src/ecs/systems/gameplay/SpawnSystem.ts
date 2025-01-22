import { Character, Controlling, Noob, SystemBuilder } from "@piggo-gg/core"

type CharacterSpawner = (player: Noob) => Character

// spawn characters for players
export const SpawnSystem = (spawner: CharacterSpawner): SystemBuilder<"SpawnSystem"> => ({
  id: "SpawnSystem",
  init: (world) => {

    const spawnedPlayers: Set<string> = new Set()

    return {
      id: "SpawnSystem",
      query: ["player"],
      onTick: (players: Noob[]) => {

        // cleanup
        spawnedPlayers.forEach((playerId) => {
          if (!world.entities[playerId]) {
            world.removeEntity(`character-${playerId}`)
            spawnedPlayers.delete(playerId)
          }
        })

        // spawn a new character
        players.forEach((player) => {
          if (!player.components.controlling.data.entityId || !spawnedPlayers.has(player.id)) {
            const character = spawner(player)
            player.components.controlling = Controlling({ entityId: character.id })
            world.addEntity(character)
            spawnedPlayers.add(player.id)

            // console.log(`spawned ${character.id}`, character.components)
          }
        })
      }
    }
  }
})
