import {
  GunSystem, IsometricGame, Piggo,
  SkellySpawnSystem, Shop, LineFloor,
  HomeButton, Background, ShopButton, HealthBarSystem
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
    systems: [SkellySpawnSystem, GunSystem, HealthBarSystem],
    entities: [
      Background({ img: "space.png" }),
      HomeButton(),
      ShopButton({ screenFixed: true, x: -95, y: 5 }),
      Shop(),
      Piggo(),
      LineFloor(dim, { x, y }, 0x0066bb, width, height),
    ]
  })
})
