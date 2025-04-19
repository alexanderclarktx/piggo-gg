import {
  SpawnSystem, isMobile, MobilePvEHUD, PvEHUD, Skelly, GameBuilder,
  CameraSystem, InventorySystem, ShadowSystem, Background, SystemBuilder,
  Controlling, floor, BlockPreview, highestBlock, values, Cursor, Chat,
  EscapeMenu, World, Block, intToBlock, max, round
} from "@piggo-gg/core"
import { createNoise2D } from 'simplex-noise';

export const Craft: GameBuilder = {
  id: "craft",
  init: () => ({
    id: "craft",
    netcode: "rollback",
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

const noise = createNoise2D(Math.random)
const spawnTerrain = (world: World) => {
  const size = 16

  for (let i = -size; i < size; i++) {
    for (let j = -size; j < size; j++) {

      const xy = intToBlock(i, j)

      const height = round(max(1, noise(i / 40, j / 40) * 10))

      for (let k = 0; k < height; k++) {
        const block = Block({ ...xy, z: k * 21 }, k > 0 ? "obsidian" : "moss")
        world.addEntity(block)
      }
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
          const group = (floor(z / 21) + 1).toString() as "1"
          collider.setGroup(group)

          // stop falling if directly above a block
          const highest = highestBlock({ x, y }, world).z
          if (highest > 0 && z < (highest + 20) && velocity.z <= 0) {
            position.data.stop = highest
          } else {
            position.data.gravity = 0.3
            position.data.stop = -600
          }

          if (position.data.z === -600) {
            position.setPosition({ x: 0, y: 0, z: 128 })
            position.setVelocity({ x: 0, y: 0, z: 0 })
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
