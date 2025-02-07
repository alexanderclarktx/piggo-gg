import {
  Piggo, SpawnSystem, Tree, isMobile, MobilePvEHUD,
  PvEHUD, Rock, Zomi, Skelly, GameBuilder, DefaultUI
} from "@piggo-gg/core"

export const Craft: GameBuilder = {
  id: "craft",
  init: (world) => ({
    id: "craft",
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
