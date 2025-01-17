import {
  ZomiSpawnSystem, DefaultGame,
  LineWall, SpawnSystem, Shop, LineFloor,
  HomeButton, Background, ShopButton, HealthBarSystem,
  Skelly
} from "@piggo-gg/core"

const width = 72
const height = 36
const dim = 16

const x = -700
const y = 500

export const Dungeon = DefaultGame({
  id: "dungeon",
  init: () => ({
    id: "dungeon",
    systems: [SpawnSystem(Skelly), ZomiSpawnSystem, HealthBarSystem],
    entities: [
      Background({ img: "space.png" }),
      HomeButton(),
      ShopButton({ screenFixed: true, x: -95, y: 5 }),
      Shop(),
      LineFloor(dim, { x, y }, 0x0066bb, width, height),
      LineWall({
        hittable: false,
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
