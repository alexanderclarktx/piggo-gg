import { Background, FloorTiles, LineWall, SpawnSystem, Skelly, GameBuilder, DefaultUI } from "@piggo-gg/core"

export const ARAM: GameBuilder = {
  id: "aram",
  init: (world) => ({
    id: "aram",
    entities: [
      ...DefaultUI(world),
      Background(),
      FloorTiles({ rows: 60, cols: 15 }),
      LineWall({ points: [
        32, 0,
        510, 240,
        -1408, 1200,
        -1884, 960,
        32, 0
      ], hittable: false })
    ],
    systems: [SpawnSystem(Skelly)],
  })
}
