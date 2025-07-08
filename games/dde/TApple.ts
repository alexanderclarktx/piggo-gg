import { Entity, Position, randomInt } from "@piggo-gg/core";

export const TApple = (): Entity<Position> => {

  const apple = Entity<Position>({
    id: `apple-${randomInt(1000)}`,
    components: {
      position: Position({ x: 10, y: 10, z: 5 })
    }
  })

  return apple
}
