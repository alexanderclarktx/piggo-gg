import { Background, Ball, Goal, HomeButton, IsometricGame, SkellySpawnSystem, Zomi } from "@piggo-gg/core";
import { FieldGrass, FieldWall } from "@piggo-gg/games";

export const Soccer = IsometricGame({
  id: "soccer",
  init: () => ({
    id: "soccer",
    entities: [
      HomeButton(),
      Background(), FieldGrass(), FieldWall(),
      Zomi({ id: "zombie1", color: 0x00eeff, positionProps: { x: 200, y: 400 } }),
      Ball({ id: "ball", position: { x: 50, y: 350 } }),
      Goal({ id: "goal1", color: 0xff0000, position: { x: -402, y: 350 }, width: 49, length: 2 }),
      Goal({ id: "goal2", color: 0x0000ff, position: { x: 502, y: 350 }, width: 49, length: 2 }),
    ],
    systems: [ SkellySpawnSystem ]
  })
});
