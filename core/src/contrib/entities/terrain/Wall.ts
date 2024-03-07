import { Collider, Debug, Entity, Position } from "@piggo-gg/core";

export type WallProps = {
  x: number
  y: number
  length: number
  width: number
  rotation?: number
}

export type LineWallProps = {
  points: number[]
}

export const LineWall = ({ points }: LineWallProps): Entity => {

  const wall = {
    id: `linewall-`,
    components: {
      position: new Position({ x: 0, y: 0 }),
      debug: new Debug(),
      collider: new Collider({
        shape: "line",
        isStatic: true,
        points
      })
    }
  }
  return wall;
}

export const Wall = ({ x, y, length, width, rotation }: WallProps): Entity => {

  const wall = {
    id: `wall-${x}${y}`,
    components: {
      position: new Position({ x, y }),
      debug: new Debug(),
      collider: new Collider({
        shape: "cuboid",
        length, width,
        isStatic: true,
        rotation: rotation ? rotation : 0
      })
    }
  }

  return wall;
}
