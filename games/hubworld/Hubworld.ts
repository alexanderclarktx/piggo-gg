import {
  Background, EnemySpawnSystem, FloorTiles,
  GunSystem, HealthBarSystem, IsometricGame,
  LineWall, PlayerSpawnSystem,
  Portal
} from "@piggo-gg/core";

export const Hubworld = IsometricGame({
  id: "hubworld",
  init: () => ({
    id: "hubworld",
    entities: [
      Background({ img: "stars.png" }),

      Portal({ pos: { x: 416, y: 80 }, game: "aram", tint: 0xaaaaff }),
      Portal({ pos: { x: -608, y: 80 }, game: "legends", tint: 0xaaaaff }),
      Portal({ pos: { x: 416, y: 592 }, game: "soccer", tint: 0xaaaaff }),
      Portal({ pos: { x: -608, y: 592 }, game: "strike", tint: 0xaaaaff }),

      FloorTiles({ rows: 7, cols: 7, position: { x: -32 * 16, y: 32 } }),
      FloorTiles({ rows: 7, cols: 7, position: { x: 32 * 16, y: 32 } }),
      FloorTiles({ rows: 25, cols: 25 }),
      FloorTiles({ rows: 7, cols: 7, position: { x: 32 * 16, y: 32 * 17 } }),
      FloorTiles({ rows: 7, cols: 7, position: { x: -32 * 16, y: 32 * 17 } }),

      LineWall({
        points: [
          32 * -8, 32 * 4.5,
          32, 0,
          32 * 10, 32 * 4.5,
          32 * 17, 32 * 1,
          32 * 24, 32 * 4.5,
          32 * 17, 32 * 8,
          32 * 26, 32 * 12.5,
          32 * 17, 32 * 17,
          32 * 24, 32 * 20.5,
          32 * 17, 32 * 24,
          32 * 10, 32 * 20.5,
          32, 32 * 25,
          32 * -8, 32 * 20.5,
          32 * -15, 32 * 24,
          32 * -22, 32 * 20.5,
          32 * -15, 32 * 17,
          32 * -24, 32 * 12.5,
          32 * -15, 32 * 8,
          32 * -22, 32 * 4.5,
          32 * -15, 32 * 1,
          32 * -8, 32 * 4.5
        ]
      })
    ],
    systems: [PlayerSpawnSystem, HealthBarSystem, EnemySpawnSystem, GunSystem],
  })
})
