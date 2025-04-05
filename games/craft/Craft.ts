import {
  Piggo, SpawnSystem, Tree, isMobile, MobilePvEHUD, PvEHUD, Rock, Skelly,
  GameBuilder, DefaultUI, CameraSystem, InventorySystem, ShadowSystem, Background,
  SystemBuilder,
  Controlling
} from "@piggo-gg/core"

export const Craft: GameBuilder = {
  id: "craft",
  init: (world) => ({
    id: "craft",
    netcode: "delay",
    state: {},
    systems: [InventorySystem, ShadowSystem, CraftSystem, CameraSystem(), SpawnSystem(Skelly)],
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

const CraftSystem = SystemBuilder({
  id: "CraftSystem",
  init: (world) => ({
    id: "CraftSystem",
    query: [],
    priority: 3, // todo
    onTick: () => {
      const players = world.queryEntities<Controlling>(["pc", "controlling"])

      for (const player of players) {
        const character = player.components.controlling.getCharacter(world)
        if (!character) continue
        const { position } = character.components

        console.log(position.data.z)
      }
      
      // console.log("CraftSystem", entities)
    }
  }),
})
