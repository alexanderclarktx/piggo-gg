import {
  Background, FloorTiles,
  GunSystem, HealthBarSystem, IsometricGame,
  LineWall, PlayerSpawnSystem
} from "@piggo-gg/core";

export const Strike = IsometricGame({
  id: "strike",
  init: () => ({
    id: "strike",
    entities: [
      Background({ img: "stars.png" }),
      FloorTiles({ rows: 15, cols: 7, position: { x: 32 * 3, y: 32 * 6.5 }, tint: 0xff6666 }), // T

      FloorTiles({ rows: 20, cols: 4, position: { x: 32 * 26, y: 32 * 2 } }),
      FloorTiles({ rows: 4, cols: 16, position: { x: 32 * 30, y: 32 * 4 } }),
      FloorTiles({ rows: 4, cols: 20, position: { x: 32 * -1, y: 32 * 15.5 } }),

      FloorTiles({ rows: 31, cols: 15, position: { x: 32 * 46, y: 32 * 12 } }), // mid

      FloorTiles({ rows: 12, cols: 4, position: { x: 36 * 52.9, y: 32 * 23.5 } }),

      FloorTiles({ rows: 15, cols: 6, position: { x: 32 * 74.5, y: 32 * 20 }, tint: 0x6666ff }), // CT
      FloorTiles({ rows: 15, cols: 10, position: { x: 32 * 47.5, y: 32 * 29.5 }, tint: 0xFFA500 }), // A

      FloorTiles({ rows: 10, cols: 15, position: { x: 32 * 60, y: 32 * 5 }, tint: 0xFFA500 }), // B

      // LineWall({ points: [32, 0, 832, 400, 32, 800, -768, 400, 32, 0] })
    ],
    systems: [PlayerSpawnSystem, HealthBarSystem, GunSystem],
  })
})
