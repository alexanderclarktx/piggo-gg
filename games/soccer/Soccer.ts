import { Ball, GameBuilder, Goal, SpaceBackground, Zombie } from "@piggo-gg/core";
import { FieldGrass, FieldWall } from "@piggo-gg/games";

export const Soccer: GameBuilder = () => ({
  entities: [
    Zombie({ id: "zombie1", color: 0x00eeff, positionProps: { x: 200, y: 400 } }),

    SpaceBackground(),    

    Goal({ id: "goal1", color: 0xff0000, position: { x: 150, y: 550 }, width: 100, length: 2 }),
    Goal({ id: "goal2", color: 0x0000ff, position: { x: 600, y: 100 }, width: 100, length: 2 }),
    Ball({ position: { x: 350, y: 350 } }),
    FieldGrass(),
    FieldWall()
  ],
  systems: []
});
