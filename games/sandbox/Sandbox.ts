import {
  DefaultGame, Piggo, SpawnSystem, Tree, isMobile,
  MobilePvEHUD, PvEHUD, Rock, Zomi, Chicko, Skelly
} from "@piggo-gg/core"

export const Sandbox = DefaultGame({
  id: "sandbox",
  init: () => ({
    id: "sandbox",
    systems: [SpawnSystem(Skelly)],
    bgColor: 0x006633,
    entities: [
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
})
