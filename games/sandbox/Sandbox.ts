import {
  ItemSystem, HomeButton, InventorySystem, IsometricGame,
  Piggo, Shop, ShopButton, SkellySpawnSystem, Tree,
  isMobile, MobilePvEHUD, PvEHUD
} from "@piggo-gg/core"

export const Sandbox = IsometricGame({
  id: "sandbox",
  init: () => ({
    id: "sandbox",
    systems: [SkellySpawnSystem, InventorySystem, ItemSystem],
    entities: [
      HomeButton(),
      ShopButton({ screenFixed: true, x: -95, y: 5 }),
      Shop(),
      isMobile() ? MobilePvEHUD() : PvEHUD(["Q", "E", "C", "X"], ["wall", "boost", "", ""]),
      Piggo(), Piggo(), Piggo(),
      Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree()
    ]
  })
})
