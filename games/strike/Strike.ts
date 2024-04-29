import {
  Background, EnemySpawnSystem, FloorTiles,
  GunSystem, HealthBarSystem, IsometricGame,
  LineWall, PlayerSpawnSystem
} from "@piggo-gg/core";

export const Strike = IsometricGame({
  id: "strike",
  init: () => ({
    id: "strike",
    entities: [
      Background({ img: "stars.png" }),
      FloorTiles({ rows: 25, cols: 25 }),
      LineWall({ points: [ 32, 0, 832, 400, 32, 800, -768, 400, 32, 0 ], health: 75 })
    ],
    systems: [PlayerSpawnSystem, HealthBarSystem, EnemySpawnSystem, GunSystem],
  })
})
