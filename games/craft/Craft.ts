import {
  SpawnSystem, isMobile, MobilePvEHUD, PvEHUD, Skelly, GameBuilder,
  CameraSystem, InventorySystem, ShadowSystem, Background, SystemBuilder,
  Controlling, floor, BlockPreview, highestBlock, values, Cursor, Chat,
  EscapeMenu, World, intToBlock, max, round, XY, snapXYToChunk, sqrt,
  blocks, BlockMesh
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
      BlockMesh()
    ]
  })
}

const spawnTerrain = () => {
  const num = 20
  for (let i = 0; i < num; i++) {
    for (let j = 0; j < num; j++) {
      const chunk = { x: i, y: j }
      spawnChunk(chunk)
    }
  }
}

type Chunk = `${number}x${number}`
const liveChunks = new Set<Chunk>()
// const liveChunks: Map<number, Map<number, true>> = new Map()

const spawnChunk = (chunk: XY) => {
  const { x, y } = chunk
  liveChunks.add(`${x}x${y}`)

  const size = 4
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const xy = intToBlock(i + x * 4, j + y * 4)
      const height = round(max(1, noise(xy.x / 300, xy.y / 300) * 10))
      for (let k = 0; k < height; k++) {
        // const block = Block({ ...xy, z: k * 21 }, k > 0 ? "obsidian" : "grass")
        // world.addEntity(block)

        blocks.add({ ...xy, z: k * 21, type: "grass" })
      }
    }
  }
}

const despawnChunk = (world: World, chunk: XY) => {
  const { x, y } = chunk
  const size = 4

  liveChunks.delete(`${x}x${y}`)

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const xy = intToBlock(x * 4 + i, y * 4 + j)

      let z = 0
      while (world.entity(`block-${xy.x}-${xy.y}-${z * 21}`)) {
        world.removeEntity(`block-${xy.x}-${xy.y}-${z * 21}`)
        z++
      }
    }
  }
}

const CraftSystem = SystemBuilder({
  id: "CraftSystem",
  init: (world) => {

    spawnTerrain()

    const playerChunks = new Map<string, XY>()

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

          const chunk = snapXYToChunk({ x, y })

          const distance = 2

          if (playerChunks.has(character.id)) {
            const prevChunk = playerChunks.get(character.id)!
            if (prevChunk.x !== chunk.x || prevChunk.y !== chunk.y) {
              playerChunks.set(character.id, chunk)

              // despawn previous chunk
              for (const liveChunk of liveChunks) {
                const [chunkX, chunkY] = liveChunk.split("x").map(Number)

                const chunkDistance = sqrt((chunk.x - chunkX) ** 2 + (chunk.y - chunkY) ** 2)
                if (chunkDistance > distance) {
                  // despawnChunk(world, { x: chunkX, y: chunkY })
                }
              }

              // spawn new chunk
              for (let i = -distance; i <= distance; i++) {
                for (let j = -distance; j <= distance; j++) {
                  const newChunk = { x: chunk.x + i, y: chunk.y + j }
                  if (!liveChunks.has(`${newChunk.x}x${newChunk.y}`)) {
                    // spawnChunk(world, newChunk)
                  }
                }
              }

            }
          } else {
            playerChunks.set(character.id, chunk)
          }

          // set collider group
          const group = (floor(z / 21) + 1).toString() as "1"
          collider.setGroup(group)

          // stop falling if directly above a block
          const highest = highestBlock({ x, y }).z
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
