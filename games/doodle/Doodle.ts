import {
  CameraSystem, Cursor, EscapeMenu, GameBuilder, Input, LagText,
  Collider, Entity, Networked, pixiGraphics, Player, Position, Renderable,
  SpawnSystem, SystemBuilder, Shadow, WASDInputMap, Action, Actions, NPC,
  Character, Team
} from "@piggo-gg/core"
import { Graphics } from "pixi.js"

export type DoodleState = {
  score: number
  highScore: number
  gameOver: boolean
}

// The player character - a little elephant that jumps on platforms
export const Jumper = (player: Player) => Character({
  id: `jumper-${player.id}`,
  components: {
    position: Position({
      x: 225, y: 0, z: 10,
      velocityResets: 1, speed: 100, gravity: 0.2
    }),
    networked: Networked(),
    team: Team(1),
    collider: Collider({
      shape: "ball",
      radius: 15,
      sensor: (platform, world) => {
        // Only bounce when landing on top of platform
        const jumper = world.entity("jumper-" + player.id)
        if (!jumper || !jumper.components.position) return false

        // Only bounce when falling down
        if (jumper.components.position.data.velocity.z >= 0) return false

        // Set velocity to bounce up
        jumper.components.position.setVelocity({ z: 7 })

        // Increase score when bouncing
        const state = world.game.state as DoodleState
        state.score += 1

        return true
      }
    }),
    input: Input({
      press: {
        ...WASDInputMap.press
      }
    }),
    actions: Actions({
      jump: Action("jump", ({ entity }) => {
        if (!entity?.components?.position) return
        entity.components.position.setVelocity({ z: 7 })
      })
    }),
    shadow: Shadow(10),
    renderable: Renderable({
      anchor: { x: 0.5, y: 0.5 },
      zIndex: 5,
      interpolate: true,
      setup: async (r) => {
        // Draw a small elephant using PIXI Graphics
        r.c = new Graphics()
          .beginFill(0x888888) // Gray elephant body
          .drawEllipse(0, 0, 15, 22)
          .endFill()
          .beginFill(0x888888) // Head
          .drawCircle(0, -20, 12)
          .endFill()
          .beginFill(0x666666) // Ears
          .drawEllipse(-15, -20, 8, 10)
          .drawEllipse(15, -20, 8, 10)
          .endFill()
          .beginFill(0x888888) // Trunk
          .drawRoundedRect(-5, -15, 10, 20, 5)
          .endFill()
          .beginFill(0xFFFFFF) // Eyes
          .drawCircle(-5, -24, 2)
          .drawCircle(5, -24, 2)
          .endFill()
      }
    })
  }
})

// Platform entity - static platforms the jumper bounces on
export const Platform = (x: number, y: number, z: number = 0) => Entity({
  id: `platform-${x}-${y}`,
  components: {
    position: Position({ x, y, z }),
    collider: Collider({
      shape: "cuboid",
      width: 60,
      length: 10,
      // height: 5,
      isStatic: true
    }),
    renderable: Renderable({
      zIndex: 3,
      setup: async (r) => {
        // Draw a green platform
        r.c = pixiGraphics()
          .roundRect(-30, -5, 60, 10, 5)
          .fill({ color: 0x22AA22 })
      }
    })
  }
})

// Camera target that follows the player
export const CameraTarget = () => Entity({
  id: "camera-target",
  components: {
    position: Position({ x: 225 }),
    npc: NPC({
      behavior: (entity, world) => {
        const player = world.client?.playerCharacter()
        if (!player || !player.components.position) return

        // Track player's vertical position for camera to follow
        entity.components.position.setPosition({
          x: 225,
          y: -1 * Math.max(entity.components.position.data.z, player.components.position.data.z)
        })

        console.log("camera target", entity.components.position.data)
      }
    })
  }
})

// Main game definition
export const Doodle: GameBuilder<DoodleState> = {
  id: "doodle",
  init: () => ({
    id: "doodle",
    netcode: "rollback",
    state: {
      score: 0,
      highScore: 0,
      gameOver: false
    },
    systems: [
      SpawnSystem(Jumper),
      DoodleSystem,
      CameraSystem({ follow: ({ y }) => ({ x: 225, y }) })
    ],
    bgColor: 0x87CEEB,
    entities: [
      EscapeMenu(),
      Cursor(),
      CameraTarget(),
      // Create initial platforms
      Platform(225, 0, -10),
      Platform(150, -50, 50),
      Platform(300, 50, 100),
      Platform(200, -70, 150),
      Platform(250, 40, 200),
      Platform(175, -30, 250),
      Platform(275, -60, 300),
      Platform(225, 20, 350),
      Platform(300, -20, 400),
      Platform(150, 60, 450),
      LagText({ y: 5 })
    ]
  })
}

// Game logic system
const DoodleSystem = SystemBuilder({
  id: "DoodleSystem",
  init: (world) => {
    // Scale camera to fit the game
    const desiredScale = world.renderer?.app.screen.width! / 450
    const scaleBy = desiredScale - world.renderer?.camera.root.scale.x! - desiredScale * 0.1 - 0.2
    world.renderer?.camera.scaleBy(scaleBy)

    return {
      id: "DoodleSystem",
      query: [],
      priority: 9,
      onTick: () => {
        const state = world.game.state as DoodleState
        const player = world.queryEntities(["pc"])[0]

        if (!player || !player.components.position) return

        // Game over if player falls too far below platforms
        if (player.components.position.data.z < -100) {
          // Reset player position
          player.components.position.setPosition({ x: 225, y: 0, z: 10 })
          player.components.position.setVelocity({ x: 0, y: 0, z: 0 })

          // Update high score
          if (state.score > state.highScore) {
            state.highScore = state.score
          }

          // Reset score
          state.score = 0
        }

        // Allow horizontal movement that wraps around
        if (player.components.position.data.x < 0) {
          player.components.position.setPosition({ x: 450 })
        } else if (player.components.position.data.x > 450) {
          player.components.position.setPosition({ x: 0 })
        }
      }
    }
  }
})
