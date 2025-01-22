import { Background, Ball, Goal, HomeButton, SpawnSystem, Skelly, GameBuilder, DefaultUI } from "@piggo-gg/core"
import { FieldGrass, FieldWall } from "@piggo-gg/games"

export const Soccer: GameBuilder = {
  id: "soccer",
  init: (world) => ({
    id: "soccer",
    entities: [
      ...DefaultUI(world),
      HomeButton(),
      Background(), FieldGrass(), FieldWall(),
      Ball({ id: "ball", position: { x: 50, y: 350 } }),
      Goal({ id: "goal1", color: 0xff0000, position: { x: -402, y: 350 }, width: 49, length: 2 }),
      Goal({ id: "goal2", color: 0x0000ff, position: { x: 502, y: 350 }, width: 49, length: 2 }),
    ],
    systems: [SpawnSystem(Skelly)]
  })
}
