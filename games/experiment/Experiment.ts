import {
  Action, Actions, blocks, ceil, Character, chunkNeighbors, Collider, Entity, floor,
  GameBuilder, Input, logRare, min, Networked, PhysicsSystem, Position, round, SpawnSystem,
  spawnTerrain, SystemBuilder, TBlockCollider, TCameraSystem, Team, XYtoChunk, XYZ
} from "@piggo-gg/core"
import { Object3D, Vector3 } from "three"

const Guy = () => Character({
  id: "guy",
  components: {
    position: Position({ friction: true, gravity: 0.002, stop: 2, z: 1, x: 0, y: 2 }),
    networked: Networked(),
    collider: Collider({
      shape: "ball",
      radius: 0.1
    }),
    input: Input({
      release: {
        "escape": () => ({ actionId: "escape" }),
        "mb1": () => ({ actionId: "escape" }),
        "f": ({ hold }) => ({ actionId: "jump", params: { hold } }),
        "g": ({ world }) => {
          world.three?.debug()
          return null
        }
      },
      press: {
        "w,s": () => null, "a,d": () => null,

        "shift,w,a": () => ({ actionId: "move", params: { key: "wa", sprint: true } }),
        "shift,w,d": () => ({ actionId: "move", params: { key: "wd", sprint: true } }),
        "shift,a,s": () => ({ actionId: "move", params: { key: "as", sprint: true } }),
        "shift,d,s": () => ({ actionId: "move", params: { key: "ds", sprint: true } }),
        "shift,w": () => ({ actionId: "move", params: { key: "w", sprint: true } }),
        "shift,a": () => ({ actionId: "move", params: { key: "a", sprint: true } }),
        "shift,s": () => ({ actionId: "move", params: { key: "s", sprint: true } }),
        "shift,d": () => ({ actionId: "move", params: { key: "d", sprint: true } }),

        "w,a": () => ({ actionId: "move", params: { key: "wa" } }),
        "w,d": () => ({ actionId: "move", params: { key: "wd" } }),
        "a,s": () => ({ actionId: "move", params: { key: "as" } }),
        "d,s": () => ({ actionId: "move", params: { key: "ds" } }),
        "w": () => ({ actionId: "move", params: { key: "w" } }),
        "a": () => ({ actionId: "move", params: { key: "a" } }),
        "s": () => ({ actionId: "move", params: { key: "s" } }),
        "d": () => ({ actionId: "move", params: { key: "d" } }),
        " ": () => ({ actionId: "move", params: { key: "up" } })
      }
    }),
    actions: Actions({
      escape: Action("escape", ({ world }) => {
        world.three?.pointerLock()
      }),
      jump: Action("jump", ({ entity, params }) => {
        const position = entity?.components?.position
        if (!position || !params.hold) return

        if (!position.data.standing) return

        position.setVelocity({ z: min(params.hold, 50) * 0.005 })
      }),
      move: Action("move", ({ entity, params, world }) => {
        const camera = world.three?.camera
        if (!camera) return

        const { position } = entity?.components ?? {}
        if (!position) return

        if (!["wa", "wd", "as", "ds", "a", "d", "w", "s", "up"].includes(params.key)) return

        const dir = camera.worldDirection(world)
        const toward = new Vector3()

        let setZ = false

        if (params.key === "a") {
          toward.crossVectors(camera.c.up, dir).normalize()
        } else if (params.key === "d") {
          toward.crossVectors(dir, camera.c.up).normalize()
        } else if (params.key === "w") {
          toward.copy(dir).normalize()
        } else if (params.key === "s") {
          toward.copy(dir).negate().normalize()
        } else if (params.key === "wa") {
          const forward = dir.clone().normalize()
          const left = new Vector3().crossVectors(camera.c.up, dir).normalize()
          toward.copy(forward.add(left).normalize())
        } else if (params.key === "wd") {
          const forward = dir.clone().normalize()
          const right = new Vector3().crossVectors(dir, camera.c.up).normalize()
          toward.copy(forward.add(right).normalize())
        } else if (params.key === "as") {
          const backward = dir.clone().negate().normalize()
          const left = new Vector3().crossVectors(camera.c.up, dir).normalize()
          toward.copy(backward.add(left).normalize())
        } else if (params.key === "ds") {
          const backward = dir.clone().negate().normalize()
          const right = new Vector3().crossVectors(dir, camera.c.up).normalize()
          toward.copy(backward.add(right).normalize())
        } else if (params.key === "up") {
          if (!position.data.standing) return
          toward.set(0, 0.04, 0)
          setZ = true
        }

        if (!setZ) {
          let factor = 0
          if (params.sprint) {
            factor = position.data.standing ? 0.9 : 0.12
          } else {
            factor = position.data.standing ? 0.5 : 0.08
          }
          position.impulse({ x: toward.x * factor, y: toward.z * factor })
        }
        if (setZ) position.setVelocity({ z: toward.y })
      })
    }),
    team: Team(1)
  }
})

export const Experiment: GameBuilder = {
  id: "3D",
  init: (world) => {

    world.renderer?.deactivate(world)
    world.three?.activate(world)

    return {
      id: "3D",
      netcode: "rollback",
      state: {},
      systems: [
        SpawnSystem(Guy),
        PhysicsSystem("global"),
        PhysicsSystem("local"),
        TCameraSystem(),
        ExperimentSystem
      ],
      entities: []
    }
  }
}

const ExperimentSystem = SystemBuilder({
  id: "ExperimentSystem",
  init: (world) => {

    // spawnTiny()
    spawnTerrain()
    let placed = false

    const blockColliders: Entity<Position | Collider>[] = Array.from(
      { length: 12 }, (_, i) => TBlockCollider(i)
    )
    world.addEntities(blockColliders)

    return {
      id: "ExperimentSystem",
      query: [],
      priority: 3,
      onTick: () => {

        const entities = world.queryEntities<Position | Collider>(["position", "team", "collider"])
        for (const entity of entities) {
          const { position } = entity.components
          const { x, y, z, velocity } = position.data

          // FOV
          // let velXY = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y)
          // velXY = max(0, velXY - 2)
          // console.log("velXY", velXY)
          // world.three!.camera.setFov(60 - (min(velXY * 0.5, 5)))

          const ij = { x: round(x / 0.3), y: round(y / 0.3) }

          // gravity
          const highest = blocks.highestBlockIJ(ij, ceil(z / 0.3 + 0.1)).z
          if (highest > 0 && z < (highest + 20) && velocity.z <= 0) {
            const stop = highest * 0.3
            position.data.stop = stop
          } else {
            position.data.stop = 0
          }

          // const interpolated = position.interpolate(world)

          // world.three!.sphere2?.position.set(
          //  interpolated.x,interpolated.z + 0.3,interpolated.y
          // )

          // set collider group
          const group = (ceil(position.data.z / 0.3) + 1).toString() as "1"
          entity.components.collider.setGroup(group)
          entity.components.collider.active = true

          const chunks = chunkNeighbors({ x: floor(ij.x / 4), y: floor(ij.y / 4) })

          let set: XYZ[] = []

          // find closest blocks
          for (const block of blocks.visible(chunks, false, true)) {
            const { x, y, z } = { x: block.x * 0.3, y: block.y * 0.3, z: block.z * 0.3 }
            if (z === 0) continue

            const zDiff = z - position.data.z
            if (zDiff > 2 || zDiff <= 0) continue
            // console.log("zDiff", zDiff)

            const dist = Math.sqrt(Math.pow(x - position.data.x, 2) + Math.pow(y - position.data.y, 2))
            if (dist < 20) set.push({ x, y, z })
          }

          // logRare(`ij: ${position.data.x},${position.data.y},${position.data.z} group: ${group} set:${set.length}`, world)

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

              const group = floor(xyz.z / 0.3).toString() as "1"
              collider.setGroup(group)
              world.three!.sphere?.position.set(xyz.x, xyz.z, xyz.y)
              // logRare(`blockCollider xyz:${xyz.x},${xyz.y},${xyz.z} group:${group}`, world)
              collider.active = true
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

            const { x, y, z } = chunkData[i]
            dummy.position.set(x * 0.3, z * 0.3, y * 0.3)
            dummy.updateMatrix()

            world.three?.blocks?.setMatrixAt(i, dummy.matrix)
            world.three!.blocks!.instanceMatrix.needsUpdate = true
          }
        }
      },
      onRender: () => {
        const pc = world.client?.playerCharacter()
        if (!pc) return

        const interpolated = pc.components.position.interpolate(world)

        world.three!.sphere2?.position.set(
          interpolated.x, interpolated.z + 0.3, interpolated.y
        )
      }
    }
  }
})
