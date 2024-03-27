import { Ball, GameBuilder, Goal, PlayerSpawnSystem, Background, World, Zombie } from "@piggo-gg/core";
import { FieldGrass, FieldWall, WallPoints } from "@piggo-gg/games";

const wallPoints: WallPoints = [
  [-400, 100],
  [-400, 300],
  [-430, 300], // notch
  [-430, 400], // notch
  [-400, 400],
  [-400, 600],
  [500, 600],
  [500, 400],
  [530, 400], // notch
  [530, 300], // notch
  [500, 300],
  [500, 100],
  [-400, 100],
]

export const Soccer: GameBuilder<"soccer"> = ({
  id: "soccer",
  init: (_: World) => ({
    id: "soccer",
    entities: [
      Zombie({ id: "zombie1", color: 0x00eeff, positionProps: { x: 200, y: 400 } }),

      Background(),

      Ball({ position: { x: 370, y: 320 } }),

      Goal({ id: "goal1", color: 0xff0000, position: { x: 148, y: 552 }, width: 98, length: 2 }),
      Goal({ id: "goal2", color: 0x0000ff, position: { x: 602, y: 98 }, width: 98, length: 2 }),

      FieldGrass(wallPoints),
      FieldWall(wallPoints)
    ],
    systems: [ PlayerSpawnSystem ]
  })
});
