import {
  SpawnSystem, isMobile, MobilePvEHUD, PvEHUD, Skelly, GameBuilder,
  DefaultUI, CameraSystem, InventorySystem, ShadowSystem, Background,
  SystemBuilder, Controlling, floor, BlockPreview, highestBlock, values
} from "@piggo-gg/core"

export const Craft: GameBuilder = {
  id: "craft",
  init: (world) => ({
    id: "craft",
    netcode: "delay",
    state: {},
    systems: [
      InventorySystem,
      ShadowSystem,
      CraftSystem,
      CameraSystem((xyz) => xyz),
      SpawnSystem(Skelly)
    ],
    entities: [
      Background({ rays: true }),
      ...DefaultUI(world),
      isMobile() ? MobilePvEHUD() : PvEHUD(),
      BlockPreview()
    ]
  })
}

const CraftSystem = SystemBuilder({
  id: "CraftSystem",
  init: (world) => ({
    id: "CraftSystem",
    query: [],
    priority: 3,
    onTick: () => {
      const players = world.queryEntities<Controlling>(["pc", "controlling"])

      for (const player of players) {
        const character = player.components.controlling.getCharacter(world)
        if (!character) continue

        const { position, collider, renderable, inventory } = character.components

        const level = floor(position.data.z / 21)

        // set collider group
        collider.setGroup((level + 1).toString() as "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9")

        // set zIndex
        renderable.zIndex = 3 + level / 10

        // active item zIndex
        if (inventory) {
          const activeItem = inventory.activeItem(world)
          if (activeItem) activeItem.components.renderable.zIndex = 3 + level / 10
        }

        const { x, y, z, velocity } = position.data

        // stop falling if directly above a block
        const highest = highestBlock({ x, y }, world)
        if (highest > 0 && z < (highest + 10) && velocity.z < 0) {
          position.data.z = highest
          position.data.standing = true
          velocity.z = 0
        }
      }

      const shadows = values(world.entities).filter(e => e.id.startsWith("shadow-"))
      for (const shadow of shadows) {
        const { position, renderable } = shadow.components
        renderable!.visible = position?.data.z !== 0
      }
    }
  })
})
