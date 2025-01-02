import {
  DefaultGame, Piggo, SkellySpawnSystem, Tree,
  isMobile, MobilePvEHUD, PvEHUD, Rock, Zomi, Chicko
} from "@piggo-gg/core"

export const Sandbox = DefaultGame({
  id: "sandbox",
  init: () => ({
    id: "sandbox",
    systems: [SkellySpawnSystem],
    entities: [
      isMobile() ? MobilePvEHUD() : PvEHUD(),
      // Zomi(),
      // Chicko(), Chicko(),
      Piggo(), Piggo(), Piggo(), Piggo(), Piggo(), Piggo(), Piggo(),
      // Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(),
      // Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(),
      // Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(),
      // Rock(), Rock(), Rock(), Rock(), Rock(), Rock(), Rock(), Rock(), Rock(),
      // Rock(), Rock(), Rock(), Rock(), Rock(), Rock(), Rock(), Rock(), Rock()
    ]
  })
})
