import {
  IsometricGame, Piggo, SkellySpawnSystem,
  Tree, isMobile, MobilePvEHUD, PvEHUD, Rock,
  Zomi
} from "@piggo-gg/core"

export const Sandbox = IsometricGame({
  id: "sandbox",
  init: () => ({
    id: "sandbox",
    systems: [SkellySpawnSystem],
    entities: [
      isMobile() ? MobilePvEHUD() : PvEHUD(),
      Piggo(), Piggo(), Piggo(), Piggo(), Piggo(), Piggo(), Piggo(),
      Zomi(), Zomi(), Zomi(), Zomi(), Zomi(), Zomi(), Zomi(),
      Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(),
      Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(),
      Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(), Tree(),
      Rock(), Rock(), Rock(), Rock(), Rock(), Rock(), Rock(), Rock(), Rock(),
      Rock(), Rock(), Rock(), Rock(), Rock(), Rock(), Rock(), Rock(), Rock()
    ]
  })
})
