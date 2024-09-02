import {
  ZombieSpawnSystem, GunSystem, IsometricGame,
  LineWall, SkellySpawnSystem, Shop, LineFloor,
  HomeButton, Background, ShopButton
} from "@piggo-gg/core";

const width = 72;
const height = 36;
const dim = 16;

const x = -700;
const y = 500;

export const Dungeon = IsometricGame({
  id: "dungeon",
  init: () => ({
    id: "dungeon",
    systems: [SkellySpawnSystem, ZombieSpawnSystem, GunSystem],
    entities: [
      Background({ img: "space.png" }),
      HomeButton(),
      ShopButton({ screenFixed: true, x: -95, y: 5 }),
      Shop(),
      LineFloor(dim, { x, y }, 0x0066bb, width, height),
      LineWall({
        shootable: false,
        points: [
          x, y,
          x + dim * width / 2, y - dim * height / 2,
          x + dim * width, y,
          x + dim * width / 2, y + dim * height / 2,
          x, y
        ]
      })
    ]
  })
})
