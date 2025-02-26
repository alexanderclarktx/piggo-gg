import { Character, Controlling, Player, SystemBuilder } from "@piggo-gg/core"

type CharacterSpawner = (player: Player) => Character

export const SpawnSystem = (spawner: CharacterSpawner): SystemBuilder<"SpawnSystem"> => ({
  id: "SpawnSystem",
  init: (world) => {

    const spawned: Record<string, string> = {}

    return {
      id: "SpawnSystem",
      query: ["pc"],
      onTick: (players: Player[]) => {

        // cleanup
        for (const playerId in spawned) {
          if (!world.entities[playerId]) {
            world.removeEntity(spawned[playerId])
            delete spawned[playerId]
          }
        }

        // spawn character
        players.forEach((player) => {
          const character = player.components.controlling.getCharacter(world)

          if (!character) {
            const character = spawner(player)
            player.components.controlling = Controlling({ entityId: character.id })

            world.addEntity(character)
            spawned[player.id] = character.id
          }
        })
      }
    }
  }
})
