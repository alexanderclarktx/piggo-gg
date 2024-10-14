import {
  InventorySystem, IsometricGame, Piggo, SkellySpawnSystem,
  Tree, isMobile, MobilePvEHUD, PvEHUD, Rock, DroppableSystem
} from "@piggo-gg/core"

export const Sandbox = IsometricGame({
  id: "sandbox",
  init: () => ({
    id: "sandbox",
    systems: [SkellySpawnSystem, InventorySystem, DroppableSystem],
    entities: [
      isMobile() ? MobilePvEHUD() : PvEHUD(),
      Piggo(), Piggo(), Piggo(), Piggo(), Piggo(), Piggo(), Piggo(),
      Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(),
      Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(),
      Rock(), Rock(), Rock(), Rock(), Rock(), Rock(), Rock(), Rock(), Rock(),
      Rock(), Rock(), Rock(), Rock(), Rock(), Rock(), Rock(), Rock(), Rock()
    ]
  })
})
