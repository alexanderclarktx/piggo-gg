import {
  DefaultGame, Piggo, SkellySpawnSystem, Tree,
  isMobile, MobilePvEHUD, PvEHUD, Rock, Zomi, Chicko
} from "@piggo-gg/core"

export const Flappy = DefaultGame({
  id: "flappy",
  init: () => ({
    id: "flappy",
    bgColor: 0x000000,
    view: "side",
    systems: [SkellySpawnSystem],
    entities: [
      isMobile() ? MobilePvEHUD() : PvEHUD(),
      // Zomi(),
      // Chicko(), Chicko(),
      // Piggo(), Piggo(), Piggo(), Piggo(), Piggo(), Piggo(), Piggo(),
      Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(),
      Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(),
      Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(),
      Rock(), Rock(), Rock(), Rock(), Rock(), Rock(), Rock(), Rock(), Rock(),
      Rock(), Rock(), Rock(), Rock(), Rock(), Rock(), Rock(), Rock(), Rock()
    ]
  })
})
