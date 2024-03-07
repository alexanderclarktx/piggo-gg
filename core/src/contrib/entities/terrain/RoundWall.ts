// import { Collider, Debug, Entity, Position } from "@piggo-gg/core";

// export type RoundWallProps = {
//   x: number
//   y: number
//   points: number[]
// }

// export const RoundWall = ({ x, y, points }: RoundWallProps): Entity => {

//   const wall = {
//     id: `roundwall-${x}${y}`,
//     components: {
//       position: new Position({ x, y }),
//       debug: new Debug(),
//       collider: new Collider({
//         shape: "hfield",
//         isStatic: true,
//         rotation: 0.75,
//         points
//       })
//     }
//   }

//   return wall;
// }
