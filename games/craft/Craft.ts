import {
  SpawnSystem, isMobile, MobilePvEHUD, PvEHUD, Skelly, GameBuilder,
  DefaultUI, CameraSystem, InventorySystem, ShadowSystem, Background,
  SystemBuilder, Controlling, Position, floor, Element
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
      CameraSystem(),
      SpawnSystem(Skelly)
    ],
    entities: [
      Background({ rays: true }),
      ...DefaultUI(world),
      isMobile() ? MobilePvEHUD() : PvEHUD()
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
      const blocks = world.queryEntities<Element | Position>(["element", "health", "collider", "position"])
        .filter(x => x.components.element.data.kind !== "flesh")

      const players = world.queryEntities<Controlling>(["pc", "controlling"])

      for (const player of players) {
        const character = player.components.controlling.getCharacter(world)
        if (!character) continue

        const { position, collider, renderable } = character.components

        const level = floor(position.data.z / 21)

        // set collider group
        collider.setGroup((level + 1).toString() as "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9")

        // set zIndex
        renderable.zIndex = 3 + level / 10

        const { x, y, z, velocity } = position.data

        // stop falling if directly above a block
        for (const block of blocks) {
          let { x: blockX, y: blockY } = block.components.position.data
          blockY += 21

          if (y < blockY && y > blockY - 18) {
            if (x < blockX + 18 && x > blockX - 18) {
              if (level === 1 && velocity.z < 0 && z < 30) {
                velocity.z = 0
                position.data.standing = true
                position.data.z = 21
              }
            }
          }
        }
      }
    }
  })
})
