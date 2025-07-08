import { Entity, Position, randomInt, XYZ } from "@piggo-gg/core";

export const TApple = (xyz: XYZ): Entity<Position> => {

  const apple = Entity<Position>({
    id: `apple-${randomInt(1000)}`,
    components: {
      position: Position(xyz)
    }
  })

  return apple
}
