import {
  Action, Actions, blocks, Character, Collider, entries, GameBuilder, Input, min, Networked,
  PhysicsSystem, Position, SpawnSystem, spawnTerrain, spawnTiny, SystemBuilder, TCameraSystem, Team,
  XYtoChunk
} from "@piggo-gg/core"
import { Object3D, Vector3 } from "three"

const Guy = () => Character({
  id: "guy",
  components: {
    position: Position({ friction: true, gravity: 0.002, stop: 0.7, z: 1, x: 0, y: 2 }),
    networked: Networked(),
    collider: Collider({
      shape: "ball",
      radius: 4
    }),
    input: Input({
      release: {
        "escape": () => ({ actionId: "escape" }),
        "mb1": () => ({ actionId: "escape" }),
        "f": ({ hold }) => ({ actionId: "jump", params: { hold } }),
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
          let factor = position.data.standing ? 0.4 : 0.1
          if (params.sprint) factor *= 2
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

    return {
      id: "ExperimentSystem",
      query: [],
      priority: 3,
      onTick: () => {
        const pc = world.client?.playerCharacter()
        // console.log("TBlockMesh pc", pc)

        if (!placed && pc) {

          const dummy = new Object3D()

          // const { position } = pc.components

          // const chunk = XYtoChunk({x: position.data.x * 20, y: position.data.y * 20})

          const chunkData = blocks.visible([
            { x: 1, y: 1 },
            { x: 1, y: 2 },
            { x: 1, y: 3 },
            { x: 2, y: 1 },
            { x: 2, y: 2 },
            { x: 2, y: 3 },
            { x: 3, y: 1 },
            { x: 3, y: 2 },
            { x: 3, y: 3 }
          ], false, true)
          // console.log("chunkData", chunkData.length, chunk.x, chunk.y)

          // for (const [i, block] of entries(chunkData)) {
          for (let i = 0; i < chunkData.length; i++) {
            placed = true

            const { x, y, z } = chunkData[i]
            // dummy.position.set(x / 60, 0, y / 30)
            dummy.position.set(x * 0.3, z * 0.3, y * 0.3)
            dummy.updateMatrix()

            world.three?.blocks?.setMatrixAt(i, dummy.matrix)
            world.three!.blocks!.instanceMatrix.needsUpdate = true

            // console.log(`Block at (${x}, ${y}, ${z}) set at index ${i}`)
            // mesh.setMatrixAt(index, dummy.setPosition(x, y, z).matrix)
          }
        }
      }
    }
  }
})
