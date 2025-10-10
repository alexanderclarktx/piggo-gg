import {
  BlockMeshSysten, BlockPhysicsSystem, Crosshair, ThreeNametagSystem, EscapeMenu,
  GameBuilder, Hitmarker, HtmlChat, HUDSystem, InventorySystem, keys, logPerf, min,
  Player, Sky, SpawnSystem, Sun, SystemBuilder, ThreeCameraSystem, ThreeSystem
} from "@piggo-gg/core"
import { Sarge } from "./Sarge"
import { StrikeMap } from "./StrikeMap"

export type StrikeState = {
  doubleJumped: string[]
  //   hit: Record<string, { tick: number, by: string }>
  lastShot: Record<string, number>
  //   phase: "warmup" | "starting" | "play"
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
      Sun({ bounds: { left: -10, right: 10, top: 10, bottom: -10 } }),
      Sky(),
      Player({ id: "player-dummy", name: "dummy" })
    ]
  })
}

const StrikeSystem = SystemBuilder({
  id: "StrikeSystem",
  init: (world) => {
    const time = performance.now()
    for (const chunk of keys(StrikeMap)) {
      const [x, y] = chunk.split("|").map(Number)

      world.blocks.setChunk({ x, y }, StrikeMap[chunk])
    }
    logPerf("loaded map", time)

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
            position.setPosition({ x: 7.45, y: 12, z: 2 })
          }
        }
        logPerf("player positions", t1)
      }
    }
  }
})
