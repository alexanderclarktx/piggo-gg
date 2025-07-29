import {
  blocks, Collider, GameBuilder, keys, logPerf, min, PI, Position,
  randomChoice, randomInt, SpawnSystem, spawnTerrain, SystemBuilder,
  BlockPhysicsSystem, TCameraSystem, trees, values, XYtoChunk
} from "@piggo-gg/core"
import { Color, Object3D, Vector3 } from "three"
import { Bird } from "./Bird"
import { BirdHUDSystem } from "./BirdHUDSystem"
import { TApple } from "./TApple"

export type DDEState = {
  doubleJumped: string[]
  applesEaten: Record<string, number>
}

export const DDE: GameBuilder<DDEState> = {
  id: "Duck Duck Eagle",
  init: (world) => {

    world.renderer?.deactivate(world)
    world.three?.activate(world)

    return {
      id: "Duck Duck Eagle",
      netcode: "rollback",
      state: {
        doubleJumped: [],
        applesEaten: {}
      },
      systems: [
        SpawnSystem(Bird),
        BlockPhysicsSystem("global"),
        BlockPhysicsSystem("local"),
        TCameraSystem(),
        DDESystem,
        BirdHUDSystem
      ],
      entities: []
    }
  }
}

const DDESystem = SystemBuilder({
  id: "DDESystem",
  init: (world) => {

    spawnTerrain(24)
    let placed = false

    let i = 1

    return {
      id: "DDESystem",
      query: [],
      priority: 3,
      onTick: () => {
        const state = world.game.state as DDEState

        const entities = world.queryEntities<Position | Collider>(["position", "team", "collider"])
        const t0 = performance.now()
        for (const entity of entities) {
          const { position } = entity.components
          const { z, rotation, standing } = position.data

          // double-jump state cleanup
          if (standing) {
            state.doubleJumped = state.doubleJumped.filter(id => id !== entity.id)
          }

          // reset rotation
          position.data.rotating = 0
          if (rotation < 0) position.data.rotating = min(0.08, -rotation)
          if (rotation > 0) position.data.rotating = -1 * min(0.08, rotation)

          // fell off the map
          if (z < -4) {
            position.setPosition({ x: 14, y: 14, z: 8 })
          }
        }
        logPerf("player positions", t0)

        // spawn apples
        const t1 = performance.now()
        if (world.tick % 10 === 0 && world.three && world.three.apples["apple-0"] && keys(world.three.apples).length < 50) {

          const randomTree = trees[randomInt(trees.length - 1)]

          const a = 0.52
          const b = 0.3
          const z = -0.24

          const randomSpot = randomChoice([
            { x: a, y: 0, z: 0 },
            { x: -a, y: 0, z: 0 },
            { x: 0, y: a, z: 0 },
            { x: 0, y: -a, z: 0 },

            { x: b, y: 0, z },
            { x: -b, y: 0, z },
            { x: 0, y: b, z },
            { x: 0, y: -b, z }
          ])
          const xyz = { x: randomTree.x + randomSpot.x, y: randomTree.y + randomSpot.y, z: randomTree.z + randomSpot.z }

          const apple = TApple(xyz, i)
          world.addEntity(apple)

          i += 1
        }
        logPerf("spawn apple", t1)

        // render apples
        const t2 = performance.now()
        const appleEntities = values(world.entities).filter(e => e.id.startsWith("apple"))
        for (const appleEntity of appleEntities) {

          const { position } = appleEntity.components
          if (!position || !world.three) continue

          const { x, y, z } = position.data

          const dummy = new Object3D()
          dummy.position.set(x, z, y)
          dummy.updateMatrix()

          if (!world.three.apples[appleEntity.id]) {
            const apple = world.three.apples["apple-0"].clone(true)

            apple.position.set(x, z, y)
            apple.updateMatrix()
            world.three.scene.add(apple)

            world.three.apples[appleEntity.id] = apple
          }
        }
        logPerf("render apples", t2)

        // render blocks
        const t3 = performance.now()
        if (!placed) {
          const dummy = new Object3D()

          const chunk = XYtoChunk({ x: 1, y: 1 })
          const neighbors = blocks.neighbors(chunk, 24)

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
              world.three?.blocks?.setColorAt(i, new Color(0x660088))
            } else if (type === 11) {
              world.three?.blocks?.setColorAt(i, new Color(0xF5F5DC))
            }

            world.three?.blocks?.setMatrixAt(i, dummy.matrix)
            world.three!.blocks!.instanceMatrix.needsUpdate = true
          }
        }
        logPerf("render blocks", t3)
      },
      onRender: (_, delta) => {
        const pc = world.client?.playerCharacter()
        if (!pc || !world.three) return

        const interpolated = pc.components.position.interpolate(world, delta)

        const { eagle, duck, sphere2 } = world.three

        sphere2?.position.set(interpolated.x, interpolated.z + 0.05, interpolated.y)
        duck?.scene.position.set(interpolated.x, interpolated.z - 0.025, interpolated.y) // 0.055

        if (eagle && duck) {
          const { rotation, rotating, aim } = pc.components.position.data

          eagle.scene.position.set(interpolated.x, interpolated.z + 0.1, interpolated.y)
          eagle.scene.rotation.z = rotation - rotating * (40 - delta) / 40

          duck.scene.rotation.y = aim.x + PI / 2
        }

        const { velocity } = pc.components.position.data

        // rotate the sphere
        world.three?.sphere2?.rotateOnWorldAxis(new Vector3(1, 0, 0), delta * velocity.y * 0.01)
        world.three?.sphere2?.rotateOnWorldAxis(new Vector3(0, 0, 1), delta * velocity.x * 0.01)
      }
    }
  }
})
