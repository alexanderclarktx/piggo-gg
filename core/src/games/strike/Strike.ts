import {
  BlockPhysicsSystem, ThreeCameraSystem, D3NametagSystem, logPerf,
  min, UIProfile, SpawnSystem, Sky, SystemBuilder, HtmlChat,
  Crosshair, GameBuilder, spawnTerrain, EscapeMenu, ThreeSystem,
  InventorySystem, Sun, BlockMeshSysten, HUDSystem
} from "@piggo-gg/core"
import { Sarge } from "./Sarge"

export type StrikeState = {
  doubleJumped: string[]
  //   hit: Record<string, { tick: number, by: string }>
  lastShot: Record<string, number>
  //   phase: "warmup" | "starting" | "play"
}

export type StrikeSettings = {
  //   ambientSound: boolean
  showControls: boolean
  //   showCrosshair: boolean
  showNametags: boolean
  mouseSensitivity: number
}

export const Strike: GameBuilder<StrikeState, StrikeSettings> = {
  id: "strike",
  init: (world) => ({
    id: "strike",
    netcode: "rollback",
    renderer: "three",
    settings: {
      ambientSound: true,
      showControls: true,
      showCrosshair: true,
      showNametags: true,
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
      SpawnSystem(Sarge),
      BlockPhysicsSystem("global"),
      BlockPhysicsSystem("local"),
      ThreeCameraSystem(),
      StrikeSystem,
      // HUDSystem,
      D3NametagSystem,
      ThreeSystem,
      InventorySystem,
      BlockMeshSysten,
      HUDSystem
    ],
    entities: [
      Crosshair(),
      EscapeMenu(world),
      // UIProfile(),
      // Scoreboard(),
      HtmlChat(),
      Sun(),
      Sky()
    ]
  })
}

const StrikeSystem = SystemBuilder({
  id: "StrikeSystem",
  init: (world) => {
    spawnTerrain(world, 24)

    // const preview = BlockPreview(world)
    // if (preview) world.three?.scene.add(preview.mesh)

    return {
      id: "StrikeSystem",
      query: [],
      priority: 3,
      onTick: () => {
        const state = world.state<StrikeState>()
        const settings = world.settings<StrikeSettings>()

        if (world.client && !world.client.mobile) world.client.mobileMenu = document.pointerLockElement === null

        const players = world.players()

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

          // if ((world.tick - state.hit[character.id]?.tick) >= 40) {
          //   position.setPosition({ x: 20, y: 20, z: 8 })
          //   delete state.hit[character.id]
          // }
        }
        logPerf("player positions", t1)
      }
    }
  }
})
