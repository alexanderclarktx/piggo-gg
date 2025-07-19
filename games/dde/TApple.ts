import { Entity, NPC, Position, XYZ, XYZdistance } from "@piggo-gg/core";
import { DDEState } from "./DDE";

export const TApple = (xyz: XYZ, i: number): Entity<Position> => {

  let removed = false

  const apple = Entity<Position>({
    id: `apple-${i}`,
    components: {
      position: Position(xyz),
      npc: NPC({
        behavior: (_, world) => {
          if (removed) return

          // todo every player
          const pc = world.client?.playerCharacter()
          if (!pc) return

          const { position } = pc.components
          const applePos = apple.components.position.data

          const dist = XYZdistance(position.data, applePos)

          if (dist < 0.16) {
            world.removeEntity(apple.id)
            removed = true

            // visual cleanup 
            world.three!.apples[apple.id]?.removeFromParent()
            delete world.three!.apples[apple.id]

            // sound effect
            world.client?.soundManager.play("eat", 0.3)

            // score
            const state = world.game.state as DDEState
            const playerId = world.client?.playerId() || ""
            if (!state.applesEaten[playerId]) {
              state.applesEaten[playerId] = 1
            } else {
              state.applesEaten[playerId] += 1
              console.log("+= 1")
            }
          }
        }
      })
    }
  })

  return apple
}
