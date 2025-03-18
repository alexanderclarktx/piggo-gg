import {
  CameraSystem, Cursor, EscapeMenu, GameBuilder, Input, LagText,
  Collider, Entity, Networked, pixiGraphics, Player, Position, Renderable,
  SpawnSystem, SystemBuilder, Shadow, Action, Actions, NPC, Character, Team, pixiText
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
      x: 225, y: 0, z: 10, velocityResets: 1, speed: 150, gravity: 0.2
    }),
    networked: Networked(),
    team: Team(1),
    collider: Collider({
      shape: "ball",
      radius: 8, // Smaller collision radius
      sensor: (platform, world) => {
        // Only bounce when landing on top of platform
        const jumper = world.entity("jumper-" + player.id)
        if (!jumper || !jumper.components.position) return false

        // Only bounce when falling down
        if (jumper.components.position.data.velocity.z >= 0) return false

        console.log("sensor", platform.id)

        // Set velocity to bounce up
        // jumper.components.position.setVelocity({ z: 7 })

        // Increase score when bouncing
        const state = world.game.state as DoodleState
        state.score += 1

        return true
      }
    }),
    input: Input({
      press: {
        "a": () => ({ actionId: "move", params: { x: -1 } }),
        "d": () => ({ actionId: "move", params: { x: 1 } })
      }
    }),
    actions: Actions({
      move: Action("move", ({ entity, params }) => {
        if (!entity?.components?.position) return
        entity.components.position.setVelocity({ x: params.x * 100 }) // Increased speed for better control
      }),
      jump: Action("jump", ({ entity }) => {
        if (!entity?.components?.position) return
        entity.components.position.setVelocity({ z: 7 })
      })
    }),
    shadow: Shadow(5),
    renderable: Renderable({
      anchor: { x: 0.5, y: 1.0 }, // Anchor at bottom center for better alignment
      zIndex: 5,
      scale: 0.5, // Smaller scale
      interpolate: true,
      setup: async (r) => {
        // Draw a small elephant using PIXI Graphics - more compact and cute
        r.c = new Graphics()
          // Body - smaller ellipse
          .beginFill(0x888888)
          .drawEllipse(0, 0, 10, 15)
          .endFill()

          // Head - smaller circle positioned better
          .beginFill(0x777777)
          .drawCircle(0, -14, 8)
          .endFill()

          // Ears - smaller and positioned better
          .beginFill(0x666666)
          .drawEllipse(-8, -14, 5, 6)
          .drawEllipse(8, -14, 5, 6)
          .endFill()

          // Trunk - smaller and cuter
          .beginFill(0x777777)
          .drawRoundedRect(-3, -12, 6, 10, 3)
          .endFill()

          // Eyes - smaller with black pupils
          .beginFill(0xFFFFFF)
          .drawCircle(-3, -16, 1.5)
          .drawCircle(3, -16, 1.5)
          .endFill()
          .beginFill(0x000000)
          .drawCircle(-3, -16, 0.8)
          .drawCircle(3, -16, 0.8)
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

// Score display
export const ScoreDisplay = () => Entity({
  id: "score-display",
  components: {
    position: Position({ x: 50, y: 30, screenFixed: true }),
    renderable: Renderable({
      zIndex: 10,
      setup: async (r) => {
        r.c = pixiText({ text: `score: 0`, style: { fill: 0xFFFFFF } })
      },
      dynamic: ({ entity, world }) => {
        const state = world.game.state as DoodleState
        const { renderable } = entity.components

        // Update score text
        if (renderable.c) {
          // renderable.c.clear()
          // renderable.c.text({
          //   text: `Score: ${state.score}   High Score: ${state.highScore}`,
          //   style: { 
          //     fill: 0xFFFFFF,
          //     fontFamily: 'Arial',
          //     fontSize: 14,
          //     stroke: 0x000000,
          //     strokeThickness: 3,
          //     align: 'left'
          //   }
          // })
        }
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
    bgColor: 0x87CEEB, // Sky blue background
    entities: [
      EscapeMenu(),
      Cursor(),
      ScoreDisplay(),
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

    // Track highest platform and highest player position for generating new platforms
    let highestPlatformZ = 450 // Start with our initial platforms
    let highestPlayerZ = 0

    // Generate a random x position for new platforms
    const randomX = () => Math.floor(Math.random() * 400) + 25

    // Generate a random y position for new platforms
    const randomY = () => Math.floor(Math.random() * 120) - 60

    return {
      id: "DoodleSystem",
      query: [],
      priority: 9,
      onTick: () => {
        const state = world.game.state as DoodleState
        const player = world.queryEntities(["pc"])[0]

        if (!player || !player.components.position) return

        const playerZ = player.components.position.data.z

        // Track highest player position
        if (playerZ > highestPlayerZ) {
          highestPlayerZ = playerZ
        }

        // Generate new platforms as player climbs higher
        // Add platforms when player is within 300 units of the highest platform
        if (highestPlayerZ > highestPlatformZ - 300) {
          // Add new platforms with increasing height
          for (let i = 0; i < 5; i++) {
            const platformZ = highestPlatformZ + 100 + i * 100
            const platform = Platform(randomX(), randomY(), platformZ)
            world.addEntity(platform)
          }

          // Update highest platform Z
          highestPlatformZ += 500
        }

        // Game over if player falls too far below their highest point
        if (playerZ < highestPlayerZ - 500) {
          // Reset player position
          player.components.position.setPosition({ x: 225, y: 0, z: 10 })
          player.components.position.setVelocity({ x: 0, y: 0, z: 0 })

          // Update high score
          if (state.score > state.highScore) {
            state.highScore = state.score
          }

          // Reset score and tracking variables
          state.score = 0
          highestPlayerZ = 0
          highestPlatformZ = 450

          // Remove all platforms except the initial ones
          const platforms = world.queryEntities(["position"]).filter(e =>
            e.id.startsWith('platform-') && e.components.position!.data.z > 450
          )

          for (const platform of platforms) {
            world.removeEntity(platform.id)
          }
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
