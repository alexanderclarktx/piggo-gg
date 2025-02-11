import {
  Background,  CameraSystem,  DefaultUI,  GameBuilder,  HealthBarSystem, InventorySystem, LineFloor,
  LineWall, PvEHUD, Shop, ShopButton, Skelly, SpawnSystem, ZomiSpawnSystem
} from "@piggo-gg/core"

const width = 72
const height = 36
const dim = 16

const x = -580
const y = 100

export const Dungeon: GameBuilder = {
  id: "dungeon",
  init: (world) => ({
    id: "dungeon",
    systems: [InventorySystem, CameraSystem(), SpawnSystem(Skelly), ZomiSpawnSystem, HealthBarSystem],
    entities: [
      ...DefaultUI(world),
      Background({ img: "space.png" }),
      ShopButton({ screenFixed: true, x: -95, y: 5 }),
      Shop(),
      PvEHUD(),
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
}
