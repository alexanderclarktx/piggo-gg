import {
  HealthBarSystem, HomeButton, InventorySystem, IsometricGame,
  Piggo, Shop, ShopButton, SkellySpawnSystem, Tree
} from "@piggo-gg/core"

export const Sandbox = IsometricGame({
  id: "sandbox",
  init: () => ({
    id: "sandbox",
    systems: [SkellySpawnSystem, InventorySystem],
    entities: [
      HomeButton(),
      ShopButton({ screenFixed: true, x: -95, y: 5 }),
      Shop(),
      Piggo(), Piggo(), Piggo(),
      Tree({ "id": "tree" })
    ]
  })
})
