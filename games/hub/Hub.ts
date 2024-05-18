import {
  Background, ZombieSpawnSystem, FloorTiles, GunSystem,
  InviteStone, IsometricGame,
  LineWall, Portal, SkellySpawnSystem
} from "@piggo-gg/core";

export const Home = IsometricGame({
  id: "hub",
  init: () => ({
    id: "hub",
    entities: [
      Background({ img: "stars.png" }),

      Portal({ pos: { x: 544, y: 144 }, game: "aram", tint: 0xff0055 }),
      Portal({ pos: { x: -480, y: 144 }, game: "legends", tint: 0x00ffcc }),
      Portal({ pos: { x: 544, y: 656 }, game: "soccer", tint: 0xaaaaff }),
      Portal({ pos: { x: -480, y: 656 }, game: "strike", tint: 0x000000 }),

      InviteStone({ pos: { x: 32 * 1, y: 32 * 3.25 }, tint: 0xddddff }),

      FloorTiles({ rows: 7, cols: 7, position: { x: -32 * 16, y: 32 } }),
      FloorTiles({ rows: 7, cols: 7, position: { x: 32 * 16, y: 32 } }),
      FloorTiles({ rows: 25, cols: 25 }),
      FloorTiles({ rows: 7, cols: 7, position: { x: 32 * 16, y: 32 * 17 } }),
      FloorTiles({ rows: 7, cols: 7, position: { x: -32 * 16, y: 32 * 17 } }),

      LineWall({
        shootable: false,
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
    systems: [SkellySpawnSystem, ZombieSpawnSystem, GunSystem],
  })
})
