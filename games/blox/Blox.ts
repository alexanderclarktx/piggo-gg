import {
  blocks, ceil, chunkNeighbors, Collider, Entity, floor, GameBuilder,
  min,
  PhysicsSystem, Position, round, SpawnSystem, spawnTerrain, SystemBuilder,
  TBlockCollider, TCameraSystem, XYtoChunk, XYZ, XYZdistance
} from "@piggo-gg/core"
import { Color, Object3D, Vector3 } from "three"
import { Bird } from "./Bird"

export const Blox: GameBuilder = {
  id: "blox",
  init: (world) => {

    world.renderer?.deactivate(world)
    world.three?.activate(world)

    return {
      id: "blox",
      netcode: "rollback",
      state: {},
      systems: [
        SpawnSystem(Bird),
        PhysicsSystem("global"),
        PhysicsSystem("local"),
        TCameraSystem(),
        BloxSystem
      ],
      entities: []
    }
  }
}

const BloxSystem = SystemBuilder({
  id: "BloxSystem",
  init: (world) => {

    // spawnTiny()
    spawnTerrain()
    let placed = false

    const blockColliders: Entity<Position | Collider>[] = Array.from(
      { length: 12 }, (_, i) => TBlockCollider(i)
    )
    world.addEntities(blockColliders)

    return {
      id: "BloxSystem",
      query: [],
      priority: 3,
      onTick: () => {

        const entities = world.queryEntities<Position | Collider>(["position", "team", "collider"])
        for (const entity of entities) {
          const { position } = entity.components
          const { x, y, z, velocity, flying, rotation } = position.data

          if (flying) {
            position.data.rotating = 0
            if (rotation < 0) position.data.rotating = min(0.05, -rotation)
            if (rotation > 0) position.data.rotating = -1 * min(0.05, rotation)

            console.log(rotation, position.data.rotating)
          }

          if (z < -4) {
            position.data.z = 10
          }

          const ij = { x: round(x / 0.3), y: round(y / 0.3) }

          // vertical stopping
          const highest = blocks.highestBlockIJ(ij, ceil(z / 0.3 + 0.1))

          if (highest !== undefined && velocity.z <= 0) {
            const stop = highest.z * 0.3 + 0.3
            position.data.stop = stop
          } else {
            position.data.stop = -5
          }

          // set collider group
          const pgroup = (floor(position.data.z / 0.3 + 0.01)).toString() as "1"
          entity.components.collider.setGroup(pgroup)
          entity.components.collider.active = true

          const chunks = chunkNeighbors({ x: floor(ij.x / 4), y: floor(ij.y / 4) })

          let set: XYZ[] = []

          // find closest blocks
          for (const block of blocks.visible(chunks, false, true)) {
            const { x, y, z } = { x: block.x * 0.3, y: block.y * 0.3, z: block.z * 0.3 }

            const zDiff = z - position.data.z
            if (zDiff > 0.5 || zDiff < -0.5) continue

            const dist = Math.sqrt(
              Math.pow(x - position.data.x, 2) +
              Math.pow(y - position.data.y, 2) +
              Math.pow(z - position.data.z, 2)
            )
            if (dist < 20) set.push({ x, y, z })
          }

          set.sort((a, b) => {
            const distA = XYZdistance(a, position.data)
            const distB = XYZdistance(b, position.data)
            return distA - distB
          })

          // update block colliders
          for (const [index, blockCollider] of blockColliders.entries()) {
            const { position, collider } = blockCollider.components
            if (set[index]) {
              const xyz = set[index]
              position.setPosition(xyz)

              const group = round(xyz.z / 0.3).toString() as "1"
              collider.setGroup(group)

              collider.active = true

              if (world.three?.debug === false) continue

              const sphere = world.three?.sphere!

              const dummy = new Object3D()
              dummy.position.set(xyz.x, xyz.z + 0.15, xyz.y)
              dummy.updateMatrix()
              sphere.setMatrixAt(index, dummy.matrix)
              sphere.instanceMatrix.needsUpdate = true

              sphere.setColorAt(index, new Color((pgroup == group) ? 0x0000ff : 0xff0000))
              sphere.instanceColor!.needsUpdate = true
            } else {
              collider.active = false
            }
          }
        }

        // render blocks
        const pc = world.client?.playerCharacter()
        if (!placed && pc) {

          const dummy = new Object3D()

          const { position } = pc.components

          const chunk = XYtoChunk({ x: position.data.x * 20, y: position.data.y * 20 })
          const neighbors = chunkNeighbors(chunk, 24)

          const chunkData = blocks.visible(neighbors, false, true)
          world.three!.blocks!.count = chunkData.length
          console.log(`rendering ${chunkData.length} blocks`)

          for (let i = 0; i < chunkData.length; i++) {
            placed = true

            const { x, y, z, type } = chunkData[i]
            dummy.position.set(x * 0.3, z * 0.3 + 0.15, y * 0.3)
            dummy.updateMatrix()

            if (type === 10) {
              world.three?.blocks?.setColorAt(i, new Color(0x00ee88))
            } else if (type === 9) {
              world.three?.blocks?.setColorAt(i, new Color(0x8B4513))
            } else if (type === 6) {
              world.three?.blocks?.setColorAt(i, new Color(0x440066))
            } else if (type === 11) {
              world.three?.blocks?.setColorAt(i, new Color(0xF5F5DC))
            }

            world.three?.blocks?.setMatrixAt(i, dummy.matrix)
            world.three!.blocks!.instanceMatrix.needsUpdate = true
          }
        }
      },
      onRender: (_, delta) => {
        const pc = world.client?.playerCharacter()
        if (!pc) return

        const interpolated = pc.components.position.interpolate(world, delta)

        world.three?.sphere2?.position.set(
          interpolated.x, interpolated.z + 0.05, interpolated.y
        )

        world.three?.duck?.scene.position.set(
          interpolated.x, interpolated.z - 0.025, interpolated.y
        )

        world.three?.eagle?.scene.position.set(
          interpolated.x, interpolated.z + 0.1, interpolated.y
        )

        const { velocity } = pc.components.position.data

        // rotate the sphere
        world.three?.sphere2?.rotateOnWorldAxis(new Vector3(1, 0, 0), delta * velocity.y * 0.01)
        world.three?.sphere2?.rotateOnWorldAxis(new Vector3(0, 0, 1), delta * velocity.x * 0.01)
      }
    }
  }
})
