import {
  BlockPhysicsSystem, D3Apple, D3CameraSystem, D3NametagSystem,
  GameBuilder, hypot, keys, localAim, logPerf, min, PI, Profile,
  SpawnSystem, spawnTerrain, sqrt, SystemBuilder, values, XYtoChunk
} from "@piggo-gg/core"
import { AnimationMixer, Color, Group, Object3D, Object3DEventMap } from "three"
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js"
import { Bird } from "./Bird"
import { BirdHUDSystem } from "./BirdHUDSystem"
import { DDEMenu } from "./DDEMenu"
import { DDEMobileUI } from "./DDEMobileUI"

export type DDEState = {
  phase: "warmup" | "starting" | "play"
  willStart: undefined | number
  doubleJumped: string[]
  applesEaten: Record<string, number>
  applesTimer: Record<string, number>
}

export const DDE: GameBuilder<DDEState> = {
  id: "Duck Duck Eagle",
  init: (world) => ({
    id: "Duck Duck Eagle",
    netcode: "rollback",
    state: {
      phase: "warmup",
      willStart: undefined,
      doubleJumped: [],
      applesEaten: {},
      applesTimer: {}
    },
    systems: [
      SpawnSystem(Bird),
      BlockPhysicsSystem("global"),
      BlockPhysicsSystem("local"),
      D3CameraSystem(),
      DDESystem,
      BirdHUDSystem,
      D3NametagSystem
    ],
    entities: [
      DDEMenu(world),
      Profile()
    ]
  })
}

const DDESystem = SystemBuilder({
  id: "DDESystem",
  init: (world) => {

    world.three?.activate(world)
    spawnTerrain(world, 24)

    DDEMobileUI(world)

    let blocksRendered = false
    let applesSpawned = false

    return {
      id: "DDESystem",
      query: [],
      priority: 3,
      onTick: () => {
        const state = world.game.state as DDEState

        const players = world.players()
        const characters = world.characters()


        if (world.mode === "server" && state.phase === "warmup" && players.length) {
          const playersReady = players.filter(p => p.components.pc.data.ready)

          if (playersReady.length === players.length) {
            state.phase = "starting"
            state.willStart = world.tick + 40 * 3
          }
        }

        if (state.phase === "starting" && world.tick >= state.willStart!) {
          state.phase = "play"

          console.log("game start")

          // regenerate blocks
        }

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

          // render assets
          if (world.three && !world.three.birdAssets[character.id]) {
            if (!world.three.duck || !world.three.eagle) continue

            const { position } = character.components

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

            world.three.birdAssets[character.id] = {
              duck, eagle, mixers: [duckMixer, eagleMixer]
            }
          }
        }
        logPerf("player positions", t0)

        const apples = values(world.entities).filter(e => e.id.startsWith("d3apple"))

        // spawn apples
        const t1 = performance.now()
        if (world.tick > 40 && !applesSpawned) for (let i = 0; i < 40 + apples.length; i++) {
          applesSpawned = true

          const randomTree = world.trees[world.random.int(world.trees.length - 1)]

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

          const apple = D3Apple({ id: `d3apple-${1 + i}`, pos: xyz })
          world.addEntity(apple)
        }
        logPerf("spawn apple", t1)

        // render apples
        const t2 = performance.now()

        for (const appleEntity of apples) {

          const { position } = appleEntity.components
          if (!position || !world.three) continue

          const { x, y, z } = position.data

          if (!world.three.apples[appleEntity.id] && world.three.apple) {
            const apple = world.three.apple.clone(true)

            apple.position.set(x, z, y)
            apple.updateMatrix()
            world.three.scene.add(apple)

            world.three.apples[appleEntity.id] = apple
          }
        }
        logPerf("render apples", t2)

        // unrender apples
        const appleEntityIds = apples.map(e => e.id)
        for (const renderedApple of keys(world.three?.apples ?? {})) {
          if (!appleEntityIds.includes(renderedApple)) {
            world.three!.apples[renderedApple]?.removeFromParent()
            delete world.three!.apples[renderedApple]
          }
        }

        // clean up old player assets
        for (const playerId in world.three?.birdAssets ?? {}) {
          if (!world.three) continue

          if (!world.entity(playerId)) {
            const { duck, eagle } = world.three.birdAssets[playerId]
            duck.removeFromParent()
            eagle.removeFromParent()
            delete world.three.birdAssets[playerId]
          }
        }

        // render blocks
        const t3 = performance.now()
        if (!blocksRendered && world.mode === "client") {
          const dummy = new Object3D()

          const chunk = XYtoChunk({ x: 1, y: 1 })
          const neighbors = world.blocks.neighbors(chunk, 24)

          const chunkData = world.blocks.visible(neighbors, false, true)
          if (world.three?.blocks) world.three.blocks.count = chunkData.length

          for (let i = 0; i < chunkData.length; i++) {
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

          blocksRendered = true
        }
        logPerf("render blocks", t3)
      },
      onRender: (_, delta) => {
        const players = world.players()

        // update player positions
        for (const player of players) {
          const character = player.components.controlling?.getCharacter(world)
          if (!character) continue

          const { position } = character.components
          if (!position) continue

          const { rotation, rotating, flying, aim } = position.data

          const interpolated = position.interpolate(world, delta)

          if (!world.three?.birdAssets[character.id]) continue

          const { duck, eagle, mixers } = world.three?.birdAssets[character.id]

          const orientation = player.id === world.client?.playerId() ? localAim : aim

          duck.visible = !position.data.flying
          duck.position.set(interpolated.x, interpolated.z - 0.025, interpolated.y)
          duck.rotation.y = orientation.x + PI / 2

          eagle.visible = position.data.flying
          eagle.position.set(interpolated.x, interpolated.z + 0.1, interpolated.y)
          eagle.rotation.y = orientation.x
          eagle.rotation.x = orientation.y
          eagle.rotation.z = rotation - rotating * (40 - delta) / 40

          for (const mixer of mixers) {
            if (flying) {
              mixer.update(sqrt(hypot(position.data.velocity.x, position.data.velocity.y, position.data.velocity.z)) * 0.005 + 0.01)
            } else {
              mixer.update(hypot(position.data.velocity.x, position.data.velocity.y) * 0.015 + 0.01)
            }
          }
        }
      }
    }
  }
})
