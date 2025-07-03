import {
  Action, Actions, blocks, ceil, Character, chunkNeighbors, Collider, Entity, floor,
  GameBuilder, Input, min, Networked, PhysicsSystem, Position, round, SpawnSystem,
  spawnTerrain, SystemBuilder, TBlockCollider, TCameraSystem, Team, XYtoChunk, XYZ, XYZdistance
} from "@piggo-gg/core"
import { Color, Object3D, Vector3 } from "three"

const Guy = () => Character({
  id: "guy",
  components: {
    position: Position({ friction: true, gravity: 0.002, stop: 2, z: 6, x: 20, y: 20 }),
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
        },
        "e": () => ({ actionId: "fly" })
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
      fly: Action("fly", ({ entity }) => {
        const { position } = entity?.components ?? {}
        if (!position) return

        position.data.flying = !position.data.flying
        console.log("flying", position.data.flying)
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

          world.client?.soundManager.play("bubble")
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
        SpawnSystem(Guy),
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
          const { x, y, z, velocity } = position.data

          if (z < -4) {
            position.data.z = 10
          }

          const ij = { x: round(x / 0.3), y: round(y / 0.3) }

          // vertical stopping
          const highest = blocks.highestBlockIJ(ij, ceil(z / 0.3 + 0.1)).z
          if (highest > 0 && velocity.z <= 0) {
            const stop = highest * 0.3 + 0.3
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

              const sphere = world.three?.sphere!

              const dummy = new Object3D()
              dummy.position.set(xyz.x, xyz.z + 0.15, xyz.y)
              dummy.updateMatrix()
              sphere.setMatrixAt(index, dummy.matrix)
              sphere.instanceMatrix.needsUpdate = true

              sphere.setColorAt(index, new Color((pgroup == group) ? 0x0000ff : 0xff0000))
              sphere.instanceColor!.needsUpdate = true

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
            dummy.position.set(x * 0.3, z * 0.3 + 0.15, y * 0.3)
            dummy.updateMatrix()

            world.three?.blocks?.setMatrixAt(i, dummy.matrix)
            world.three!.blocks!.instanceMatrix.needsUpdate = true
          }
        }
      },
      onRender: (_, delta) => {
        const pc = world.client?.playerCharacter()
        if (!pc) return

        const interpolated = pc.components.position.interpolate(world)

        world.three?.sphere2?.position.set(
          interpolated.x, interpolated.z + 0.05, interpolated.y
        )

        const { velocity } = pc.components.position.data

        // rotate the sphere
        world.three?.sphere2?.rotateOnWorldAxis(new Vector3(1, 0, 0), delta * velocity.y * 0.01)
        world.three?.sphere2?.rotateOnWorldAxis(new Vector3(0, 0, 1), delta * velocity.x * 0.01)
      }
    }
  }
})
