import {
  blocks, Collider, GameBuilder, keys, logPerf, min, PI, Position,
  SpawnSystem, spawnTerrain, SystemBuilder, BlockPhysicsSystem,
  TCameraSystem, trees, values, XYtoChunk, localAim
} from "@piggo-gg/core"
import { AnimationMixer, Color, Group, Object3D, Object3DEventMap, Skeleton, SkeletonHelper } from "three"
import { Bird } from "./Bird"
import { BirdHUDSystem } from "./BirdHUDSystem"
import { TApple } from "./TApple"

import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';

export type DDEState = {
  doubleJumped: string[]
  applesEaten: Record<string, number>
  applesTimer: Record<string, number>
}

export const DDE: GameBuilder<DDEState> = {
  id: "Duck Duck Eagle",
  init: (world) => {

    // world.renderer?.deactivate(world)
    world.three?.activate(world)

    return {
      id: "Duck Duck Eagle",
      netcode: "rollback",
      state: {
        doubleJumped: [],
        applesEaten: {},
        applesTimer: {}
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

    spawnTerrain(world, 24)
    let placed = false

    // let i = 1

    return {
      id: "DDESystem",
      query: [],
      priority: 3,
      onTick: () => {
        const state = world.game.state as DDEState

        const characters = world.queryEntities<Position | Collider>(["position", "team", "collider"])
        const t0 = performance.now()
        for (const character of characters) {
          const { position } = character.components
          const { z, rotation, standing } = position.data

          // double-jump state cleanup
          if (standing) {
            state.doubleJumped = state.doubleJumped.filter(id => id !== character.id)
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

        const numApples = keys(world.entities).filter(id => id.startsWith("tapple-")).length

        // spawn apples
        const t1 = performance.now()
        if (world.tick % 10 === 0 && world.tick > 40 && numApples < 50) {

          const randomTree = trees[world.random.int(trees.length - 1)]

          const a = 0.52
          const b = 0.3
          const z = -0.24

          const randomSpot = world.random.choice([
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

          const apple = TApple(xyz, 1 + numApples)
          world.addEntity(apple)
        }
        logPerf("spawn apple", t1)

        // render apples
        const t2 = performance.now()
        const appleEntities = values(world.entities).filter(e => e.id.startsWith("tapple"))
        for (const appleEntity of appleEntities) {

          const { position } = appleEntity.components
          if (!position || !world.three) continue

          const { x, y, z } = position.data

          if (!world.three.apples[appleEntity.id] && world.three.apples["tapple-0"]) {
            const apple = world.three.apples["tapple-0"].clone(true)

            apple.position.set(x, z, y)
            apple.updateMatrix()
            world.three.scene.add(apple)

            world.three.apples[appleEntity.id] = apple
          }
        }
        logPerf("render apples", t2)

        // unrender apples
        const appleEntityIds = appleEntities.map(e => e.id)
        for (const renderedApple of keys(world.three?.apples ?? {})) {
          if (renderedApple === "tapple-0") continue

          if (!appleEntityIds.includes(renderedApple)) {
            world.three!.apples[renderedApple]?.removeFromParent()
            delete world.three!.apples[renderedApple]
            console.log("removed apple", renderedApple)
          }
        }

        // render ducks and eagles
        for (const character of characters) {
          if (!world.three) continue
          if (!world.three.playerAssets[character.id]) {
            if (!world.three.duck || !world.three.eagle) continue

            const { position } = character.components

            // const duck = world.three.duck.clone(true)
            const duck = clone(world.three.duck) as Group<Object3DEventMap>

            world.three.scene.add(duck)

            duck.position.set(position.data.x, position.data.z + 0.05, position.data.y)
            duck.frustumCulled = false
            duck.scale.set(0.08, 0.08, 0.08)

            const eagle = clone(world.three.eagle) as Group<Object3DEventMap>

            world.three.scene.add(eagle)

            eagle.position.set(position.data.x, position.data.z + 0.1, position.data.y)
            eagle.frustumCulled = false
            eagle.scale.set(0.05, 0.05, 0.05)

            const duckMixer = new AnimationMixer(duck)
            duckMixer.clipAction(duck.animations[1]).play()

            const eagleMixer = new AnimationMixer(eagle)
            eagleMixer.clipAction(eagle.animations[0]).play()

            world.three.playerAssets[character.id] = {
              duck, eagle, mixers: [duckMixer, eagleMixer]
            }

            console.log("added duck", character.id, duck)
          }
        }

        // render blocks
        const t3 = performance.now()
        if (!placed && world.mode === "client") {
          const dummy = new Object3D()

          console.log("placing")

          const chunk = XYtoChunk({ x: 1, y: 1 })
          const neighbors = blocks.neighbors(chunk, 24)

          const chunkData = blocks.visible(neighbors, false, true)
          if (world.three?.blocks) world.three.blocks.count = chunkData.length
          // console.log(`rendering ${chunkData.length} blocks`)

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
            if (world.three?.blocks) world.three.blocks.instanceMatrix.needsUpdate = true
          }
        }
        logPerf("render blocks", t3)
      },
      onRender: (_, delta) => {
        const players = world.players()

        for (const player of players) {
          const character = player.components.controlling?.getCharacter(world)
          if (!character) continue

          const { position } = character.components
          if (!position) continue

          const interpolated = position.interpolate(world, delta)

          const { duck, eagle } = world.three?.playerAssets[character.id] ?? {}
          if (duck) {
            duck.position.set(interpolated.x, interpolated.z - 0.025, interpolated.y)
            duck.rotation.y = localAim.x + PI / 2
            duck.visible = !position.data.flying
          }

          if (eagle) {
            eagle.position.set(interpolated.x, interpolated.z + 0.1, interpolated.y)
            eagle.rotation.y = localAim.x
            eagle.rotation.x = localAim.y
            eagle.visible = position.data.flying
          }
        }

        // const interpolated = pc.components.position.interpolate(world, delta)

        // const { eagles, ducks, sphere2 } = world.three

        // sphere2?.position.set(interpolated.x, interpolated.z + 0.05, interpolated.y)
        // duck?.scene.position.set(interpolated.x, interpolated.z - 0.025, interpolated.y) // 0.055

        // if (eagle && duck) {
        //   const { rotation, rotating } = pc.components.position.data

        //   eagle.scene.position.set(interpolated.x, interpolated.z + 0.1, interpolated.y)

        //   eagle.scene.rotation.y = localAim.x
        //   eagle.scene.rotation.x = localAim.y
        //   eagle.scene.rotation.z = rotation - rotating * (40 - delta) / 40

        //   duck.scene.rotation.y = localAim.x + PI / 2
        // }

        // const { velocity } = pc.components.position.data

        // rotate the sphere
        // world.three?.sphere2?.rotateOnWorldAxis(new Vector3(1, 0, 0), delta * velocity.y * 0.01)
        // world.three?.sphere2?.rotateOnWorldAxis(new Vector3(0, 0, 1), delta * velocity.x * 0.01)
      }
    }
  }
})
