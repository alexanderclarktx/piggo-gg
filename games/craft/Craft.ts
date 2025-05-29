import {
  SpawnSystem, isMobile, MobilePvEHUD, PvEHUD, Skelly, GameBuilder,
  CameraSystem, InventorySystem, ShadowSystem, Background, SystemBuilder,
  Controlling, floor, highestBlock, Cursor, Chat, EscapeMenu, blocks,
  BlockMesh, Position, Collider, Entity, XYZ, BlockCollider, spawnChunk,
  XYtoChunk, Tooltip, PhysicsSystem, chunkNeighors, Piggo
} from "@piggo-gg/core"

export const Craft: GameBuilder = {
  id: "craft",
  init: () => ({
    id: "craft",
    netcode: "rollback",
    state: {},
    systems: [
      PhysicsSystem("local"),
      PhysicsSystem("global"),
      InventorySystem,
      ShadowSystem,
      CraftSystem,
      CameraSystem((xyz) => xyz),
      SpawnSystem(Skelly)
    ],
    entities: [
      Background({ rays: true, follow: true }),
      Cursor(), Chat(), EscapeMenu(),
      // Piggo(),
      isMobile() ? MobilePvEHUD() : PvEHUD(),
      BlockMesh(),
      Tooltip("controls", "   move: WASD\n   jump: SPACE\n  break: LEFT-CLICK\n  place: RIGHT-CLICK \n camera: Q", { x: 0, y: 30 })
    ]
  })
}

const spawnTerrain = () => {
  const num = 100
  for (let i = 0; i < num; i++) {
    for (let j = 0; j < num; j++) {
      const chunk = { x: i, y: j }
      spawnChunk(chunk)
    }
  }
}

const spawnTiny = () => {
  const num = 8
  for (let i = 0; i < num; i++) {
    for (let j = 0; j < num; j++) {
      blocks.add({ x: i + 5, y: j + 5, z: 0, type: 1 })
    }
  }

  blocks.add({ x: 9, y: 9, z: 1, type: 2 })
}

const CraftSystem = SystemBuilder({
  id: "CraftSystem",
  init: (world) => {

    spawnTerrain()
    // spawnTiny()

    const blockColliders: Entity<Position | Collider>[] = [
      BlockCollider(0),
      BlockCollider(1),
      BlockCollider(2),
      BlockCollider(3),
      BlockCollider(4),
      BlockCollider(5),
      BlockCollider(6),
      BlockCollider(7),
      BlockCollider(8),
      BlockCollider(9),
      BlockCollider(10),
      BlockCollider(11),
      BlockCollider(12)
    ]
    world.addEntities(blockColliders)

    return {
      id: "CraftSystem",
      query: [],
      priority: 3,
      onTick: () => {

        // gravity
        const entities = world.queryEntities<Position>(["position"])
        for (const entity of entities) {
          const { position } = entity.components

          const { x, y, z, velocity } = position.data

          const chunk = XYtoChunk(position.data)
          const chunks = chunkNeighors(chunk)

          const highest = highestBlock({ x, y }, chunks, z).z
          if (highest > 0 && z < (highest + 20) && velocity.z <= 0) {
            position.data.stop = highest
          } else {
            position.data.gravity = 0.3
            position.data.stop = -600
          }
        }

        const players = world.queryEntities<Controlling>(["pc", "controlling"])

        for (const player of players) {
          const character = player.components.controlling.getCharacter(world)
          if (!character) continue

          const { position } = character.components

          // set collider group
          const group = (floor(position.data.z / 21) + 1).toString() as "1"
          character.components.collider.setGroup(group)

          const playerChunk = XYtoChunk(position.data)

          const chunks = chunkNeighors(playerChunk)

          if (position.data.z === -600) {
            position.setPosition({ x: 0, y: 200, z: 128 })
            position.setVelocity({ x: 0, y: 0, z: 0 })
          }

          let set: XYZ[] = []

          // find closest blocks
          for (const block of blocks.data(chunks)) {
            const { x, y, z } = block
            if (z === 0) continue

            const zDiff = z - position.data.z
            if (zDiff > 100 || zDiff < -21) continue

            const dist = Math.sqrt(Math.pow(x - position.data.x, 2) + Math.pow(y - position.data.y, 2))
            if (dist < 150) set.push({ x, y, z })
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
      }
    }
  }
})
