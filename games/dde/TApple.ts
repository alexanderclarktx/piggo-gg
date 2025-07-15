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
            console.log(`Apple collected at ${applePos.x}, ${applePos.y}, ${applePos.z}`)

            // visual cleanup 
            world.three!.apples[i]?.removeFromParent()
            world.three!.apples.splice(i, 1)
          }
        }
      })
    }
  })

  return apple
}
