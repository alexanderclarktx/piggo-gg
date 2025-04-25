import {
  SpawnSystem, isMobile, MobilePvEHUD, PvEHUD, Skelly, GameBuilder,
  CameraSystem, InventorySystem, ShadowSystem, Background, SystemBuilder,
  Controlling, floor, BlockPreview, highestBlock, values, Cursor, Chat,
  EscapeMenu, intToBlock, max, round, XY, blocks, BlockMeshOcclusion,
  BlockMesh, Position, Collider, Entity, XYZ, BlockCollider,
  BlockTypeInt
} from "@piggo-gg/core"
import { createNoise2D } from 'simplex-noise';

const noise = createNoise2D(Math.random)

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
      BlockPreview(),
      BlockMesh(),
      BlockMeshOcclusion()
    ]
  })
}

const spawnTerrain = () => {
  const num = 50
  for (let i = 0; i < num; i++) {
    for (let j = 0; j < num; j++) {
      const chunk = { x: i, y: j }
      spawnChunk(chunk)
    }
  }
}

const spawnChunk = (chunk: XY) => {
  const { x, y } = chunk

  const size = 4
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const xy = intToBlock(i + x * 4, j + y * 4)
      const height = round(max(1, noise(xy.x / 400, xy.y / 400) * 14))
      for (let k = 0; k < height; k++) {
        const type = k > 10 ? "moonrock" : k == 0 ? "saphire" : "grass"
        blocks.add({ ...xy, z: k * 21, type: BlockTypeInt[type] })
      }
    }
  }
}

const CraftSystem = SystemBuilder({
  id: "CraftSystem",
  init: (world) => {

    spawnTerrain()

    const blockColliders: Entity<Position | Collider>[] = [
      BlockCollider(0),
      BlockCollider(1),
      BlockCollider(2),
      BlockCollider(3),
      BlockCollider(4),
      BlockCollider(5),
      BlockCollider(6),
      BlockCollider(7)
    ]
    world.addEntities(blockColliders)

    return {
      id: "CraftSystem",
      query: [],
      priority: 3,
      onTick: () => {
        const players = world.queryEntities<Controlling>(["pc", "controlling"])

        for (const player of players) {
          const character = player.components.controlling.getCharacter(world)
          if (!character) continue

          const { position } = character.components
          const { x, y, z, velocity } = position.data

          // set collider group
          const group = (floor(z / 21) + 1).toString() as "1"
          character.components.collider.setGroup(group)

          // stop falling if directly above a block
          const highest = highestBlock({ x, y }).z
          if (highest > 0 && z < (highest + 20) && velocity.z <= 0) {
            position.data.stop = highest
          } else {
            position.data.gravity = 0.3
            position.data.stop = -600
          }

          if (position.data.z === -600) {
            position.setPosition({ x: 0, y: 200, z: 128 })
            position.setVelocity({ x: 0, y: 0, z: 0 })
          }

          let set: XYZ[] = []

          // find closest blocks
          for (const block of blocks.data) {
            const { x, y, z } = block
            if (z === 0) continue

            const zDiff = z - position.data.z
            if (zDiff > 100 || zDiff < -21) continue

            const dist = Math.sqrt(Math.pow(x - position.data.x, 2) + Math.pow(y - position.data.y, 2))
            if (dist < 100) set.push({ x, y, z })
          }

          set.sort((a, b) => {
            const distA = Math.sqrt(Math.pow(a.x - position.data.x, 2) + Math.pow(a.y - position.data.y, 2))
            const distB = Math.sqrt(Math.pow(b.x - position.data.x, 2) + Math.pow(b.y - position.data.y, 2))
            return distA - distB
          })

          // update block colliders
          for (const [index, blockCollider] of blockColliders.entries()) {
            const { position, collider } = blockCollider.components
            if (set[index]) {
              const xyz = set[index]
              position.setPosition(xyz)
              collider.setGroup((xyz.z / 21 + 1).toString() as "1")
              collider.active = true
            } else {
              collider.active = false
            }
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
