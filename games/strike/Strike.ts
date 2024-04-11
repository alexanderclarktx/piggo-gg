import { Background, GameBuilder, Health, HealthBarSystem, PlayerSpawnSystem, FloorTiles, Zombie, EnemySpawnSystem } from "@piggo-gg/core";

export const Strike: GameBuilder<"strike"> = ({
  id: "strike",
  init: () => ({
    id: "strike",
    entities: [
      Background({ img: "stars.png" }),
      FloorTiles({ rows: 50, cols: 50 }),
    ],
    systems: [PlayerSpawnSystem, HealthBarSystem, EnemySpawnSystem]
  })
})
