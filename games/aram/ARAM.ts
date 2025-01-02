import { Background, FloorTiles, HomeButton, DefaultGame, LineWall, SkellySpawnSystem } from "@piggo-gg/core"

export const ARAM = DefaultGame({
  id: "aram",
  init: () => ({
    id: "aram",
    entities: [
      HomeButton(),
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
    systems: [SkellySpawnSystem],
  })
})
