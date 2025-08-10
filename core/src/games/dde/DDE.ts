import {
  BlockPhysicsSystem, D3Apple, D3CameraSystem, D3NametagSystem, GameBuilder,
  hypot, localAim, logPerf, min, PI, Profile, Random, randomInt,
  SpawnSystem, spawnTerrain, sqrt, SystemBuilder, XYtoChunk, XYZdistance
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
  nextSeed: number
  doubleJumped: string[]
  applesEaten: Record<string, number>
  applesTimer: Record<string, number>
}

export type DDESettings = {
  ambientSound: boolean
}

export const DDE: GameBuilder<DDEState, DDESettings> = {
  id: "Duck Duck Eagle",
  init: (world) => ({
    id: "Duck Duck Eagle",
    netcode: "rollback",
    settings: {
      ambientSound: true
    },
    state: {
      phase: "warmup",
      nextSeed: 123456111,
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

    let musicPlaying = false

    return {
      id: "DDESystem",
      query: [],
      priority: 3,
      onTick: () => {
        const state = world.game.state as DDEState
        const settings = world.game.settings as DDESettings

        if (!musicPlaying && world.client?.soundManager.ready && settings.ambientSound) {
          musicPlaying = world.client.soundManager.play({ soundName: "birdsong1" })
        } else if (world.client?.soundManager.sounds.birdsong1.state === "stopped") {
          musicPlaying = false
        } else if (musicPlaying && !settings.ambientSound) {
          world.client?.soundManager.stop("birdsong1")
          musicPlaying = false
        }

        if (world.tick === 2) world.three?.resize()

        const players = world.players()
        const characters = world.characters()

        if (world.mode === "server" && state.phase === "warmup" && players.length) {
          const playersReady = players.filter(p => p.components.pc.data.ready)

          if (playersReady.length === players.length) {
            state.phase = "starting"
            state.willStart = world.tick + 40 * 3
            state.nextSeed = randomInt(1000000)
          }
        }

        if (state.phase === "starting" && world.tick === state.willStart!) {
          state.phase = "play"

          // new random seed
          world.random = Random(state.nextSeed)

          // reset world state
          world.blocks.clear()
          world.trees = []
          blocksRendered = false

          // rebuild the world
          spawnTerrain(world, 24)

          // reset player positions
          for (const character of characters) {
            const { position } = character.components

            position.setPosition({ x: 20, y: 20, z: 6 })
            position.setVelocity({ x: 0, y: 0, z: 0 })
            position.data.flying = false
          }
        }

        const t1 = performance.now()
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

          // if eagle, check if eaten a duck
          if (world.mode === "server" && position.data.flying) {
            const ducks = characters.filter(c => c.components.position.data.flying === false)

            for (const duck of ducks) {
              const duckPos = duck.components.position

              const distance = XYZdistance(position.data, duckPos.data)

              if (distance < 0.2) {
                duckPos.setPosition({ x: 20, y: 20, z: 6 })
              }
            }
          }
        }
        logPerf("player positions", t1)

        // spawn apples
        if (!applesSpawned) {
          for (let i = 0; i < 40; i++) {
            world.addEntity(D3Apple({ id: `d3apple-${1 + i}` }))
          }
          applesSpawned = true
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
        if (!blocksRendered && world.mode === "client" && world.three?.blocks) {
          const dummy = new Object3D()

          const chunk = XYtoChunk({ x: 1, y: 1 })
          const neighbors = world.blocks.neighbors(chunk, 24)

          const chunkData = world.blocks.visible(neighbors, false, true)
          world.three.blocks.count = chunkData.length

          const { blocks } = world.three

          for (let i = 0; i < chunkData.length; i++) {
            const { x, y, z, type } = chunkData[i]

            dummy.position.set(x * 0.3, z * 0.3 + 0.15, y * 0.3)
            dummy.updateMatrix()

            if (type === 10) {
              blocks.setColorAt(i, new Color(0x00ee88))
            } else if (type === 9) {
              blocks.setColorAt(i, new Color(0x8B4513))
            } else if (type === 6) {
              blocks.setColorAt(i, new Color(0x660088))
            } else if (type === 11) {
              blocks.setColorAt(i, new Color(0xF5F5DC))
            } else {
              blocks.setColorAt(i, new Color(0xFFFFFF))
            }

            blocks.setMatrixAt(i, dummy.matrix)
          }
          blocks.instanceMatrix.needsUpdate = true
          if (blocks.instanceColor) blocks.instanceColor.needsUpdate = true

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
          if (duck.visible) {
            duck.position.set(interpolated.x, interpolated.z - 0.025, interpolated.y)
            duck.rotation.y = orientation.x + PI / 2
          }

          eagle.visible = position.data.flying
          if (eagle.visible) {
            eagle.position.set(interpolated.x, interpolated.z + 0.06, interpolated.y)
            eagle.rotation.y = orientation.x
            eagle.rotation.x = orientation.y
            eagle.rotation.z = rotation - rotating * (40 - delta) / 40
          }

          if (world.three?.debug && player.id === world.client?.playerId()) {
            world.three?.sphere?.position.set(interpolated.x, interpolated.z + 0.05, interpolated.y)
          }

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
