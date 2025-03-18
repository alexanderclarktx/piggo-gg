import {
  CameraSystem, Cursor, EscapeMenu, GameBuilder, Input, LagText, Collider, Entity,
  Networked, pixiGraphics, Player, Position, Renderable, SpawnSystem, SystemBuilder,
  Action, Actions, Character, Team, pixiText, NPC, reduce
} from "@piggo-gg/core"
import { Graphics } from "pixi.js"

export type DoodleState = {
  score: number
  highScore: number
  gameOver: boolean
}

export const Jumper = (player: Player) => {

  const jumper = Character({
    id: `jumper-${player.id}`,
    components: {
      position: Position({ x: 225, y: 10, velocityResets: 0 }),
      networked: Networked(),
      team: Team(1),
      npc: NPC({
        behavior: () => {
          // Apply custom gravity - a constant acceleration downward
          const { velocity } = jumper.components.position.data
          velocity.y += 2
          velocity.x = reduce(velocity.x, 0.9) // Apply air resistance
        }
      }),
      collider: Collider({
        shape: "ball",
        radius: 5,
        sensor: (platform, world) => {

          const { position } = jumper.components

          if (position.data.y > platform.components.position.data.y) return false
          if (position.data.velocity.y <= 0) return false

          console.log("bounce", platform.id)

          // Set velocity to bounce up
          position.setVelocity({ y: -100 })

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
          entity.components.position.setVelocity({ x: params.x * 50 })
        })
      }),
      renderable: Renderable({
        position: { x: 0, y: -2 },
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
  return jumper
}

export const Platform = (x: number, y: number) => Entity({
  id: `platform-${x}-${y}`,
  components: {
    position: Position({ x, y }),
    collider: Collider({
      shape: "cuboid",
      width: 5,
      length: 30,
      isStatic: true
    }),
    renderable: Renderable({
      zIndex: 3,
      setup: async (r) => {
        r.c = pixiGraphics()
          .roundRect(-30, -5, 60, 10, 5)
          .fill({ color: 0x22AA22 })
      }
    })
  }
})

export const Score = () => {

  const text = pixiText({ text: `Score: ${0}`, style: { fill: 0xFFFFFF, fontSize: 36, fontWeight: 'bold' } })

  const score = Entity<Position>({
    id: "score-display",
    components: {
      position: Position({ x: 225, y: 30, screenFixed: true }),
      renderable: Renderable({
        zIndex: 10,
        anchor: { x: 0.5, y: 0 },
        setContainer: async () => text,
        dynamic: ({ world }) => {
          const state = world.game.state as DoodleState

          text.text = `Score: ${state.score}`

          const screenWidth = world.renderer?.app.screen.width
          if (screenWidth) score.components.position.data.x = screenWidth / 2
        }
      })
    }
  })
  return score
}

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
      Score(),
      // Create initial platforms
      Platform(225, 0),
      Platform(150, -50),
      Platform(300, 50),
      Platform(200, -70),
      Platform(250, 40),
      Platform(175, -30),
      Platform(275, -60),
      Platform(225, 20),
      Platform(300, -20),
      Platform(150, 60),
      LagText({ y: 5 })
    ]
  })
}

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
            const platformY = highestPlatformZ + 100 + i * 100
            const platform = Platform(randomX(), platformY)
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
