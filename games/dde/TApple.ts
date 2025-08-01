import { Entity, Networked, NPC, Position, XYZ, XYZdistance } from "@piggo-gg/core";
import { DDEState } from "./DDE";

export const TApple = (xyz: XYZ, i: number): Entity<Position> => {

  let removed = false

  const apple = Entity<Position>({
    id: `tapple-${i}`,
    components: {
      position: Position(xyz),
      networked: Networked(),
      npc: NPC({
        behavior: (_, world) => {
          if (removed) return

          const players = world.players()

          for (const player of players) {
            const character = player.components.controlling?.getCharacter(world)
            if (!character) continue

            const { position } = character.components

            const applePos = apple.components.position.data

            const dist = XYZdistance(position.data, applePos)

            if (dist < 0.16) {
              world.removeEntity(apple.id)
              removed = true

              // visual cleanup 
              if (world.three) {
                world.three!.apples[apple.id]?.removeFromParent()
                delete world.three!.apples[apple.id]
              }

              // sound effect
              world.client?.soundManager.play("eat", 0.3)

              if (position.data.flying) return

              // score
              const state = world.game.state as DDEState
              const playerId = player.id

              if (!state.applesEaten[playerId]) {
                state.applesEaten[playerId] = 1
                state.applesTimer[playerId] = world.tick
              } else {
                state.applesEaten[playerId] += 1

                if (state.applesEaten[playerId] >= 10) {
                  const timeElapsed = (world.tick - state.applesTimer[playerId]) * 25 / 1000
                  console.log(`Player ${playerId} has eaten 10 apples!`, timeElapsed.toFixed(2), "seconds")

                  state.applesEaten[playerId] = 0
                  delete state.applesTimer[playerId]
                }
              }
            }
          }
        }
      })
    }
  })

  return apple
}
