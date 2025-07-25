import {
  SpawnSystem, isMobile, MobilePvEHUD, PvEHUD, Skelly, GameBuilder,
  CameraSystem, InventorySystem, ShadowSystem, Background, SystemBuilder,
  Controlling, floor, highestBlock, Cursor, Chat, EscapeMenu, blocks,
  BlockMesh, Position, Collider, Entity, XYZ, BlockCollider,
  XYtoChunk, Tooltip, PhysicsSystem, RenderSystem, spawnTerrain
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
      RenderSystem,
      CameraSystem((xyz) => xyz),
      SpawnSystem(Skelly)
    ],
    entities: [
      Background({ rays: true, follow: true }),
      Cursor(), Chat(), EscapeMenu(),
      // Piggo(),
      isMobile() ? MobilePvEHUD() : PvEHUD(),
      BlockMesh(),
      Tooltip("controls", "   move: WASD\n   jump: SPACE\n  break: LEFT-CLICK\n  place: RIGHT-CLICK \n camera: Q")
    ]
  })
}

const CraftSystem = SystemBuilder({
  id: "CraftSystem",
  init: (world) => {

    spawnTerrain()
    // spawnTiny()

    const blockColliders: Entity<Position | Collider>[] = Array.from(
      { length: 12 }, (_, i) => BlockCollider(i)
    )
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
          const chunks = blocks.neighbors(chunk)

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

          const chunks = blocks.neighbors(playerChunk)

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
