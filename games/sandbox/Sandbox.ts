import {
  HomeButton, InventorySystem, IsometricGame,
  Piggo, SkellySpawnSystem, Tree, isMobile, MobilePvEHUD, PvEHUD
} from "@piggo-gg/core"

export const Sandbox = IsometricGame({
  id: "sandbox",
  init: () => ({
    id: "sandbox",
    systems: [SkellySpawnSystem, InventorySystem],
    entities: [
      HomeButton(),
      isMobile() ? MobilePvEHUD() : PvEHUD(),
      Piggo(), Piggo(), Piggo(),
      Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree()
    ]
  })
})
