import {
  SpawnSystem, isMobile, MobilePvEHUD, PvEHUD, Skelly, GameBuilder, CameraSystem,
  InventorySystem, ShadowSystem, Background, SystemBuilder, Controlling,
  floor, BlockPreview, highestBlock, values, Cursor, Chat, EscapeMenu,
  World,
  snapXY,
  Block,
  intToBlock
} from "@piggo-gg/core"

export const Craft: GameBuilder = {
  id: "craft",
  init: () => ({
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
      Background({ rays: true, follow: true }),
      Cursor(), Chat(), EscapeMenu(),
      isMobile() ? MobilePvEHUD() : PvEHUD(),
      BlockPreview()
    ]
  })
}

const spawnTerrain = (world: World) => {
  // add a block
  // const xy = snapXY({ x: 0, y: 0 })
  // console.log("spawning block at", xy)
  // const block = Block({ ...xy, z: 0 })
  // world.addEntity(block)

  for (let i = -10; i < 10; i++) {
    for (let j = -10; j < 10; j++) {
      // const x = i * 21
      // const y = j * 21
      // const z = Math.floor(Math.random() * 3) * 21
      const snapped = intToBlock(i, j)
      const block = Block({ ...snapped, z: 0 })
      // console.log("spawning block at", snapped)
      world.addEntity(block)
    }
  }
}

const CraftSystem = SystemBuilder({
  id: "CraftSystem",
  init: (world) => {

    spawnTerrain(world)

    return {
      id: "CraftSystem",
      query: [],
      priority: 3,
      onTick: () => {
        const players = world.queryEntities<Controlling>(["pc", "controlling"])

        for (const player of players) {
          const character = player.components.controlling.getCharacter(world)
          if (!character) continue

          const { position, collider } = character.components
          const { x, y, z, velocity } = position.data

          // set collider group
          collider.setGroup((floor(z / 21) + 1).toString() as "1" | "2" | "3")

          // stop falling if directly above a block
          const highest = highestBlock({ x, y }, world)
          if (highest > 0 && z < (highest + 5) && velocity.z <= 0) {
            position.data.z = highest
            position.data.standing = true
            velocity.z = 0
            position.data.gravity = 0
          } else {
            position.data.gravity = 0.3
          }
        }

        const shadows = values(world.entities).filter(e => e.id.startsWith("shadow-"))
        for (const shadow of shadows) {
          const { position, renderable } = shadow.components
          renderable!.visible = position?.data.z !== 0
        }
      }
    }
  }
})
