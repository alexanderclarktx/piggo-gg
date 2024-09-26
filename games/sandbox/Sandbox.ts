import {
  HealthBarSystem, HomeButton, InventorySystem, IsometricGame, LineFloor, Piggo, Shop, ShopButton, SkellySpawnSystem
} from "@piggo-gg/core";

const width = 72;
const height = 36;
const dim = 16;

const x = -700;
const y = 500;

export const Sandbox = IsometricGame({
  id: "sandbox",
  init: () => ({
    id: "sandbox",
    systems: [SkellySpawnSystem, HealthBarSystem, InventorySystem],
    entities: [
      HomeButton(),
      ShopButton({ screenFixed: true, x: -95, y: 5 }),
      Shop(),
      Piggo(),
      LineFloor(dim, { x, y }, 0x0066bb, width, height),
    ]
  })
})
