import { Entity, Networked, NPC, Position, XYZ, XYZdistance } from "@piggo-gg/core"

// TODO this is a duplicate from DDE
type DDEState = {
  phase: "warmup" | "play"
  doubleJumped: string[]
  applesEaten: Record<string, number>
  applesTimer: Record<string, number>
}

export const D3Apple = ({ id, pos }: { id: string, pos?: XYZ }): Entity<Position> => {

  let removed = false

  const apple = Entity<Position>({
    id,
    components: {
      position: Position(pos ?? { x: 0, y: 0, z: 0 }),
      networked: Networked(),
      npc: NPC({
        behavior: (_, world) => {
          if (removed) return

          const applePos = apple.components.position.data

          for (const player of world.players()) {
            const character = player.components.controlling?.getCharacter(world)
            if (!character) continue

            const { position } = character.components

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
              world.client?.soundManager.play({ soundName: "eat", start: 0.3, threshold: { pos: applePos, distance: 5 } })

              if (position.data.flying) return

              // update state
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
