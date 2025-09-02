import {
  BlockPhysicsSystem, D3Apple, D3CameraSystem, D3NametagSystem,
  logPerf, min, D3Profile, Random, randomInt, SpawnSystem,
  SystemBuilder, XYZdistance, HtmlChat, Crosshair, BlockTypeString,
  GameBuilder, spawnTerrain, EscapeMenu, ThreeSystem, InventorySystem
} from "@piggo-gg/core"
import { Color, Object3D } from "three"
import { Bird } from "./Bird"
import { HUDSystem } from "./HUDSystem"
import { DDEMobileUI } from "./DDEMobileUI"
import { Scoreboard } from "./Scoreboard"
import { Starfield } from "./Starfield"

export type DDEState = {
  applesEaten: Record<string, number>
  doubleJumped: string[]
  hit: Record<string, { tick: number, by: string }>
  lastShot: Record<string, number>
  lastRocket: Record<string, number>
  nextSeed: number
  phase: "warmup" | "starting" | "play"
  round: number
  startedEagle: string[]
  willStart: undefined | number
}

export type DDESettings = {
  ambientSound: boolean
  showControls: boolean
  showCrosshair: boolean
  mouseSensitivity: number
}

export const DDE: GameBuilder<DDEState, DDESettings> = {
  id: "Duck Duck Eagle",
  init: (world) => ({
    id: "Duck Duck Eagle",
    netcode: "rollback",
    settings: {
      ambientSound: true,
      showControls: true,
      showCrosshair: true,
      mouseSensitivity: 1
    },
    state: {
      applesEaten: {},
      doubleJumped: [],
      hit: {},
      lastShot: {},
      lastRocket: {},
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
      D3NametagSystem,
      ThreeSystem,
      InventorySystem
    ],
    entities: [
      Crosshair(),
      EscapeMenu(world),
      D3Profile(),
      Scoreboard(),
      HtmlChat()
    ]
  })
}

const DDESystem = SystemBuilder({
  id: "DDESystem",
  init: (world) => {

    world.three?.activate(world)
    spawnTerrain(world, 24)

    const starfield = Starfield(world.three!.scene)

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

        starfield.update()

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

        if (world.blocks.needsUpdate()) blocksRendered = false

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
          }

          if (world.client) {
            world.client.controls.localAim.x = 0
            world.client.controls.localAim.y = -0.2
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
            position.setPosition({ x: 20, y: 20, z: 8 })
          }

          if ((world.tick - state.hit[character.id]?.tick) >= 40) {
            position.setPosition({ x: 20, y: 20, z: 8 })
            delete state.hit[character.id]
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

        // render blocks
        const t3 = performance.now()
        if (!blocksRendered && world.mode === "client" && world.three?.blocks) {
          const dummy = new Object3D()

          const neighbors = world.blocks.neighbors({ x: 1, y: 1 }, 24)
          const chunkData = world.blocks.visible(neighbors)
          // console.log(`rendering ${chunkData.length} blocks`)

          const { blocks, spruce, oak, leaf } = world.three

          let spruceCount = 0
          let oakCount = 0
          let leafCount = 0
          let otherCount = 0

          for (let i = 0; i < chunkData.length; i++) {
            const { x, y, z } = chunkData[i]
            const type = BlockTypeString[chunkData[i].type]

            dummy.position.set(x * 0.3, z * 0.3 + 0.15, y * 0.3)
            dummy.updateMatrix()

            if (type === "spruceLeaf") {
              leaf!.setColorAt(leafCount, new Color(0x0099aa))
            } else if (type === "oakLeaf") {
              leaf!.setColorAt(leafCount, new Color(0x33dd77))
            } else if (type === "oak") {
              oak!.setColorAt(oakCount, new Color(0xffaa99))
            } else if (type === "spruce") {
              spruce!.setColorAt(spruceCount, new Color(0xbb66ff))
            } else {
              // blocks.setColorAt(i, new Color(0xFFFFFF))
            }

            if (type === "spruce") {
              spruce?.setMatrixAt(spruceCount, dummy.matrix)
              spruceCount++
            } else if (type === "oak") {
              oak?.setMatrixAt(oakCount, dummy.matrix)
              oakCount++
            } else if (type === "spruceLeaf" || type === "oakLeaf") {
              leaf?.setMatrixAt(leafCount, dummy.matrix)
              leafCount++
            } else {
              blocks.setMatrixAt(otherCount, dummy.matrix)
              otherCount++
            }
          }
          blocks.instanceMatrix.needsUpdate = true
          spruce!.instanceMatrix.needsUpdate = true
          oak!.instanceMatrix.needsUpdate = true
          leaf!.instanceMatrix.needsUpdate = true

          if (spruce?.instanceColor) spruce.instanceColor.needsUpdate = true
          if (oak?.instanceColor) oak.instanceColor.needsUpdate = true
          if (leaf?.instanceColor) leaf.instanceColor.needsUpdate = true

          world.three!.blocks.count = otherCount
          world.three!.leaf!.count = leafCount
          world.three!.oak!.count = oakCount
          world.three!.spruce!.count = spruceCount

          blocksRendered = true
        }
        logPerf("render blocks", t3)
      }
    }
  }
})
