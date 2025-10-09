import { Character, Controlling, Player, SystemBuilder } from "@piggo-gg/core"

type CharacterSpawner = (player: Player) => Character

export const SpawnSystem = (spawner: CharacterSpawner) => SystemBuilder<"SpawnSystem">({
  id: "SpawnSystem",
  init: (world) => {

    const spawned: Record<string, string> = {}

    return {
      id: "SpawnSystem",
      query: ["pc"],
      priority: 5,
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

            return
          }

          if (!character.components.health) return

          const { died } = character.components.health.data
          if (died === undefined) return

          if (died + 120 < world.tick) {
            console.log("respawning", player.id, character.id, world.tick)

            // reset health
            character.components.health.data.hp = character.components.health.data.maxHp

            // reset died
            character.components.health.data.died = undefined

            // reset position
            character.components.position.setPosition({ x: 7.45, y: 12, z: 2 })
          }
        })
      }
    }
  }
})
