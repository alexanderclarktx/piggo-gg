import {
  Piggo, SpawnSystem, Tree, isMobile, MobilePvEHUD,
  PvEHUD, Rock, Zomi, Chicko, Skelly, GameBuilder,
  DefaultUI
} from "@piggo-gg/core"

export const Sandbox: GameBuilder = {
  id: "sandbox",
  init: (world) => ({
    id: "sandbox",
    systems: [SpawnSystem(Skelly)],
    bgColor: 0x006633,
    entities: [
      ...DefaultUI(world),
      isMobile() ? MobilePvEHUD() : PvEHUD(),
      Zomi(),
      // Chicko(), Chicko(),
      Piggo(), Piggo(), Piggo(), Piggo(), Piggo(), Piggo(), Piggo(),
      Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(),
      Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(),
      Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(),
      Rock(), Rock(), Rock(), Rock(), Rock(), Rock(), Rock(), Rock(), Rock(),
      Rock(), Rock(), Rock(), Rock(), Rock(), Rock(), Rock(), Rock(), Rock()
    ]
  })
}
