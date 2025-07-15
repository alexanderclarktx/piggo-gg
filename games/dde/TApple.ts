import { Entity, NPC, Position, XYZ, XYZdistance } from "@piggo-gg/core";

export const TApple = (xyz: XYZ, i: number): Entity<Position> => {

  let removed = false

  const apple = Entity<Position>({
    id: `apple-${i}`,
    components: {
      position: Position(xyz),
      npc: NPC({
        behavior: (_, world) => {
          if (removed) return

          const pc = world.client?.playerCharacter()
          if (!pc) return

          const { position } = pc.components
          const applePos = apple.components.position.data

          const dist = XYZdistance(position.data, applePos)

          if (dist < 0.4) {
            world.removeEntity(apple.id)
            removed = true

            // visual cleanup 
            world.three!.apples[apple.id]?.removeFromParent()
            delete world.three!.apples[apple.id]

            // sound effect
            world.client?.soundManager.play("eat", 0.2)
          }
        }
      })
    }
  })

  return apple
}
