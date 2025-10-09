import { Character, Controlling, Player, SystemBuilder } from "@piggo-gg/core"

type CharacterSpawner = (player: Player) => Character

export const SpawnSystem = (spawner: CharacterSpawner) => SystemBuilder<"SpawnSystem">({
  id: "SpawnSystem",
  init: (world) => {

    const spawned: Record<string, string> = {}

    const dead: Record<string, number> = {}

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
          }

          if (character?.components.health?.dead() && !dead[player.id]) {
            dead[player.id] = world.tick
          }

          if (character && dead[player.id] && dead[player.id] + 80 < world.tick) {
            // reset health
            character.components.health!.data.hp = character.components.health!.data.maxHp

            // reset position
            character.components.position.setPosition({ x: 7.45, y: 12, z: 2 })

            delete dead[player.id]
          }
        })
      }
    }
  }
})
