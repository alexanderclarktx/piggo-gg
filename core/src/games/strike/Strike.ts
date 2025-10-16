import {
  BlockMeshSysten, BlockPhysicsSystem, Crosshair, ThreeNametagSystem,
  EscapeMenu, GameBuilder, Hitmarker, HtmlChat, HUDSystem,
  InventorySystem, logPerf, min, Sky, SpawnSystem, Sun, SystemBuilder,
  ThreeCameraSystem, ThreeSystem, DummyPlayer, HtmlFeed
} from "@piggo-gg/core"
import { Sarge } from "./Sarge"
import { RetakeMap, RetakeMapColoring } from "./RetakeMap"

export type StrikeState = {
  jumped: string[]
}

export type StrikeSettings = {
  showControls: boolean
  showCrosshair: boolean
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
      jumped: [],
      hit: {},
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
      ThreeNametagSystem,
      ThreeSystem,
      InventorySystem,
      BlockMeshSysten,
      HUDSystem
    ],
    entities: [
      Crosshair(),
      Hitmarker(),
      EscapeMenu(world),
      // UIProfile(),
      // Scoreboard(),
      HtmlChat(),
      HtmlFeed(),
      Sun({
        bounds: { left: -10, right: 12, top: 0, bottom: -9 },
        // pos: { x: 200, y: 200, z: 200 }
      }),
      Sky(),
      DummyPlayer()
    ]
  })
}

const StrikeSystem = SystemBuilder({
  id: "StrikeSystem",
  init: (world) => {

    world.blocks.loadMap(RetakeMap)
    world.blocks.coloring = RetakeMapColoring

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

          const { position, health } = character.components
          const { z, rotation, standing, velocity } = position.data

          // jump state cleanup
          if (standing && velocity.z <= 0) {
            state.jumped = state.jumped.filter(id => id !== character.id)
          }

          // reset rotation
          position.data.rotating = 0
          if (rotation < 0) position.data.rotating = min(0.08, -rotation)
          if (rotation > 0) position.data.rotating = -1 * min(0.08, rotation)

          // fell off the map
          if (z < -4) {
            position.setPosition({ x: 9.9, y: 15, z: 2 })
          }
        }
        logPerf("player positions", t1)
      }
    }
  }
})
