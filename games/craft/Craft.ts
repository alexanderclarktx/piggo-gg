import {
  Piggo, SpawnSystem, Tree, isMobile, MobilePvEHUD, PvEHUD, Rock, Skelly,
  GameBuilder, DefaultUI, CameraSystem, InventorySystem, ShadowSystem, Background,
  SystemBuilder, Controlling, Position, floor, Element
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

      const blocks = world.queryEntities<Element | Position>(["element", "health", "collider", "position"])
        .filter(x => x.components.element.data.kind === "rock")

      for (const player of players) {
        const character = player.components.controlling.getCharacter(world)
        if (!character) continue

        const { position, collider } = character.components
        if (!collider) continue

        const group = floor(position.data.z / 21) + 1 // 21?
        collider.setGroup(group.toString() as "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9")

        const { x, y, z, velocity } = position.data


        // if we're directly above a block, stop at the block height
        for (const block of blocks) {
          let { x: blockX, y: blockY } = block.components.position.data
          blockY += 21

          if (y < blockY && y > blockY - 18) {
            if (x < blockX + 18 && x > blockX - 18) {
              if (group === 2 && velocity.z < 0 && z < 30) {
                velocity.z = 0
                position.data.standing = true
                position.data.z = 21.1
                console.log("stop", z)
              }
            }
          }
        }


        // if (group === 2 && position.data.velocity.z < 0) {
        //   position.data.gravity = 0
        //   position.data.velocity.z = 0
        // }

        // console.log(position.data.z, group)
      }





      // console.log("CraftSystem", entities)
    }
  }),
})
