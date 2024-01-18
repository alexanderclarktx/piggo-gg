import { Collider, Debug, Entity, Position } from "@piggo-legends/core";

export type WallProps = {
  x: number,
  y: number,
  length: number,
  width: number,
}

export const Wall = ({ x, y, length, width }: WallProps): Entity => {

  const wall = {
    id: `wall-${x}${y}`,
    components: {
      position: new Position({ x, y }),
      debug: new Debug(),
      collider: new Collider({ length, width, isStatic: true })
    }
  }

  return wall;
}
