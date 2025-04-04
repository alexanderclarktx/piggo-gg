import {
  Piggo, SpawnSystem, Tree, isMobile, MobilePvEHUD, PvEHUD, Rock, Skelly,
  GameBuilder, DefaultUI, CameraSystem, InventorySystem, ShadowSystem, Background
} from "@piggo-gg/core"

export const Craft: GameBuilder = {
  id: "craft",
  init: (world) => ({
    id: "craft",
    netcode: "delay",
    state: {},
    systems: [InventorySystem, ShadowSystem, CameraSystem(), SpawnSystem(Skelly)],
    entities: [
      Background({ rays: true }),
      ...DefaultUI(world),
      isMobile() ? MobilePvEHUD() : PvEHUD(),
      // Zomi(),
      // Chicko(), Chicko(),
      // Piggo(), Piggo(), Piggo(), Piggo(), Piggo(), Piggo(), Piggo(), // TODO these should get spawned by a system
      // Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(),
      // Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(),
      // Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(),
      // Rock(), Rock(), Rock(), Rock(), Rock(), Rock(), Rock(), Rock(), Rock(),
      // Rock(), Rock(), Rock(), Rock(), Rock(), Rock(), Rock(), Rock(), Rock()
    ]
  })
}
