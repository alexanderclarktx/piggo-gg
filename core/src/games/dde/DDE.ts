import {
  BlockPhysicsSystem, D3Apple, D3CameraSystem, D3NametagSystem, GameBuilder,
  hypot, localAim, logPerf, min, PI, D3Profile, Random, randomInt, SpawnSystem,
  spawnTerrain, sqrt, SystemBuilder, XYtoChunk, XYZdistance, HtmlChat,
  Crosshair
} from "@piggo-gg/core"
import { AnimationMixer, Color, Group, Object3D, Object3DEventMap } from "three"
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js"
import { Bird } from "./Bird"
import { HUDSystem } from "./HUDSystem"
import { DDEMenu } from "./DDEMenu"
import { DDEMobileUI } from "./DDEMobileUI"
import { Scoreboard } from "./Scoreboard"

export type DDEState = {
  applesEaten: Record<string, number>
  doubleJumped: string[]
  nextSeed: number
  phase: "warmup" | "starting" | "play"
  round: number
  startedEagle: string[]
  willStart: undefined | number
}

export type DDESettings = {
  ambientSound: boolean
  showControls: boolean
  eagleCrosshair: boolean
}

export const DDE: GameBuilder<DDEState, DDESettings> = {
  id: "Duck Duck Eagle",
  init: (world) => ({
    id: "Duck Duck Eagle",
    netcode: "rollback",
    settings: {
      ambientSound: true,
      showControls: true,
      eagleCrosshair: false
    },
    state: {
      applesEaten: {},
      doubleJumped: [],
      nextSeed: 123456111,
      phase: "warmup",
      round: 0,
      startedEagle: [],
      willStart: undefined
    },
    systems: [
      SpawnSystem(Bird),
      BlockPhysicsSystem("global"),
      BlockPhysicsSystem("local"),
      D3CameraSystem(),
      DDESystem,
      HUDSystem,
      D3NametagSystem
    ],
    entities: [
      DDEMenu(world),
      D3Profile(),
      Scoreboard(),
      HtmlChat(),
      Crosshair()
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
    let ambient = false

    return {
      id: "DDESystem",
      query: [],
      priority: 3,
      onTick: () => {
        const state = world.state<DDEState>()
        const settings = world.settings<DDESettings>()

        const { sound } = world.client ?? {}

        // ambient sound
        if (!ambient && sound?.ready && settings.ambientSound) {
          ambient = sound.play({ name: "birdsong1" })
        } else if (sound?.tones.birdsong1.state === "stopped") {
          ambient = false
        } else if (ambient && !settings.ambientSound) {
          sound?.stop("birdsong1")
          ambient = false
        }

        const players = world.players()
        const characters = world.characters()

        let shouldStart = false

        // start if all players ready
        if (world.mode === "server" && state.phase === "warmup" && players.length > 1) {
          const notReady = players.filter(p => !p.components.pc.data.ready)
          if (notReady.length === 0) shouldStart = true
        }

        // start next round if no ducks left
        if (world.mode === "server" && state.phase === "play") {
          const ducks = characters.filter(c => !c.components.position.data.flying)

          if (ducks.length === 0) {
            if (characters.length === state.startedEagle.length) {
              const winner = players[0].components.pc.data.name
              world.announce(`${winner} wins! GG!`)

              state.phase = "warmup"
              state.startedEagle = []
              state.round = 0

              players.forEach(p => {
                p.components.pc.data.ready = false
                p.components.pc.data.points = 0
              })
            } else {
              shouldStart = true
            }
          }
        }

        if (shouldStart) {
          state.phase = "starting"
          state.willStart = world.tick + 40 * 3
          state.nextSeed = randomInt(1000000)
        }

        if (state.phase === "starting" && world.tick === state.willStart!) {

          world.announce(`round ${state.round + 1}!`)

          // update state
          state.applesEaten = {}
          state.phase = "play"
          state.round += 1

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

            position.setPosition({ x: 14 + world.random.int(12, 6), y: 14 + world.random.int(12, 6), z: 6 })
            position.setVelocity({ x: 0, y: 0, z: 0 })
            position.data.flying = false
            localAim.x = 0
            localAim.y = -0.2
          }

          // choose who starts as eagle
          const candidates = characters.filter(c => !state.startedEagle.includes(c.id))
          const eagle = world.random.choice(candidates)
          if (eagle) {
            eagle.components.position.data.flying = true
            eagle.components.position.setPosition({ x: 15, y: 31, z: 6 })

            state.startedEagle.push(eagle.id)
          }
        }

        const t1 = performance.now()
        for (const player of players) {
          const character = player.components.controlling?.getCharacter(world)
          if (!character) continue

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

              if (distance < 0.24) {
                if (state.phase === "play") {
                  duckPos.data.flying = true
                  player.components.pc.data.points += 3
                  world.announce(`${player.components.pc.data.name} caught a duck!`)
                } else {
                  duckPos.setPosition({ x: 20, y: 20, z: 6 })
                }
              }
            }
          }
        }
        logPerf("player positions", t1)

        // spawn apples
        if (!applesSpawned) {
          for (let i = 0; i < 25; i++) {
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
