import { Background, FloorTiles, GunSystem, HealthBarSystem, HomeButton, IsometricGame, LineWall, ScorePanel, Scoreboard } from "@piggo-gg/core";
import { StrikeSystem } from "@piggo-gg/games";

const W32 = 32;

export const Strike = IsometricGame({
  id: "strike",
  init: () => ({
    id: "strike",
    systems: [StrikeSystem, GunSystem, HealthBarSystem],
    entities: [
      HomeButton(),
      Background(),
      ScorePanel(), Scoreboard(),
      FloorTiles({ rows: 15, cols: 7, position: { x: W32 * 3, y: W32 * 6.5 }, color: 0xff6666 }), // T

      FloorTiles({ rows: 20, cols: 4, position: { x: W32 * 26, y: W32 * 2 } }),

      FloorTiles({ rows: 12, cols: 4, position: { x: W32 * 50, y: W32 * 2 } }),
      FloorTiles({ rows: 4, cols: 20, position: { x: W32 * -1, y: W32 * 15.5 } }),
      FloorTiles({ rows: 4, cols: 16, position: { x: W32 * 30, y: W32 * 4 } }),
      FloorTiles({ rows: 4, cols: 16, position: { x: W32 * 14, y: W32 * 12 } }),
      FloorTiles({ rows: 4, cols: 4, position: { x: W32 * 54, y: W32 * 4 } }),

      FloorTiles({ rows: 10, cols: 15, position: { x: W32 * 58, y: W32 * 6 }, color: 0xffccaa }), // B
      FloorTiles({ rows: 2, cols: 4, position: { x: W32 * 59, y: W32 * 16.5 } }),
      FloorTiles({ rows: 2, cols: 4, position: { x: W32 * 48, y: W32 * 11 } }),
      FloorTiles({ rows: 31, cols: 15, position: { x: W32 * 46, y: W32 * 12 } }), // mid

      FloorTiles({ rows: 4, cols: 8, position: { x: W32 * 73, y: W32 * 13.5 } }),
      FloorTiles({ rows: 9, cols: 4, position: { x: W32 * 81, y: W32 * 17.5 } }),
      FloorTiles({ rows: 4, cols: 6, position: { x: W32 * 57, y: W32 * 21.5 } }),
      FloorTiles({ rows: 15, cols: 6, position: { x: W32 * 70, y: W32 * 21 }, color: 0x6666ff }), // CT

      FloorTiles({ rows: 4, cols: 2, position: { x: W32 * 34, y: W32 * 33 } }),
      FloorTiles({ rows: 4, cols: 2, position: { x: W32 * 45, y: W32 * 27.5 } }),
      FloorTiles({ rows: 4, cols: 4, position: { x: W32 * 57, y: W32 * 29.5 } }),

      FloorTiles({ rows: 15, cols: 10, position: { x: W32 * 47, y: W32 * 28.5 }, color: 0xffccaa }), // A

      LineWall({ shootable: false, points: [224, 384, 864, 704, 640, 816, 0, 496, 224, 384] }),
      LineWall({ shootable: false, points: [-352, 448, 128, 208, 128, 208, 352, 320, 864, 64, 1248, 256, 1632, 64, 2752, 624, 1376, 1312, -352, 448] }),
      LineWall({ shootable: false, points: [864, 192, 1376, 448, 992, 640, 480, 384, 864, 192] }),
      LineWall({ shootable: false, points: [1376, 320, 1504, 384, 1760, 256, 1632, 192, 1376, 320] }),
      LineWall({ shootable: false, points: [1920, 528, 1856, 560, 1632, 448, 1696, 416, 1920, 528] }),
      LineWall({ shootable: false, points: [2048, 784, 1856, 688, 2240, 496, 2496, 624, 2336, 704, 2272, 672, 2048, 784] }),
      LineWall({ shootable: false, points: [1120, 1056, 1344, 944, 1408, 976, 1184, 1088, 1120, 1056] }),
      LineWall({ shootable: false, points: [1856, 944, 1728, 1008, 1472, 880, 1728, 752, 1920, 848, 1792, 912, 1856, 944] }),
    ]
  })
})
