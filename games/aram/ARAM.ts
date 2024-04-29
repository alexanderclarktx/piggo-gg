import { Background, FloorTiles, GunSystem, HealthBarSystem, IsometricGame, LineWall, PlayerSpawnSystem } from "@piggo-gg/core";

export const ARAM = IsometricGame({
  id: "aram",
  init: () => ({
    id: "aram",
    entities: [
      Background(),
      FloorTiles({ rows: 60, cols: 15 }),
      LineWall({ points: [
        32, 0,
        510, 240,
        -1408, 1200,
        -1884, 960,
        32, 0
      ], health: 75 })
    ],
    systems: [PlayerSpawnSystem, HealthBarSystem, GunSystem],
  })
})
