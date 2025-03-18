import {
  CameraSystem, Cursor, EscapeMenu, GameBuilder, Input, Collider, Entity,
  Networked, pixiGraphics, Player, Position, Renderable, SpawnSystem, SystemBuilder,
  Action, Actions, Character, Team, pixiText, NPC, reduce, ceil, Debug
} from "@piggo-gg/core"

export type JumpState = {
  highScore: number
  gameOver: boolean
}

export const Jumper = (player: Player) => {
  const jumper = Character({
    id: `jumper-${player.id}`,
    components: {
      position: Position({ x: 150, y: 0, velocityResets: 0 }),
      debug: Debug(),
      networked: Networked(),
      team: Team(1),
      npc: NPC({
        behavior: () => {
          const { position } = jumper.components
          position.data.velocity.y += 4
          position.data.velocity.x = reduce(position.data.velocity.x, 2) // Apply air resistance

          if (position.data.y > 100) {
            position.setPosition({ x: 150, y: -50 }).setVelocity({ x: 0, y: 0 })
          }

          if (position.data.x > 300) {
            position.setPosition({ x: 0 })
          } else if (position.data.x < 0) {
            position.setPosition({ x: 300 })
          }
        }
      }),
      collider: Collider({
        shape: "ball",
        radius: 5,
        group: "notself",
        sensor: (platform) => {
          const { position } = jumper.components

          if (position.data.y > platform.components.position.data.y) return false
          if (position.data.velocity.y <= 0) return false

          // Set velocity to bounce up
          position.setVelocity({ y: -250 })

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
          entity.components.position.setVelocity({ x: params.x * 70 })
        })
      }),
      renderable: Renderable({
        position: { x: 0, y: -2 },
        zIndex: 5,
        scale: 0.5, // Smaller scale
        interpolate: true,
        setup: async (r) => {
          // Draw a small elephant using PIXI Graphics - more compact and cute
          r.c = pixiGraphics()
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
      setContainer: async () => {
        return pixiGraphics().roundRect(-30, -5, 60, 10, 5).fill({ color: 0x22AA22 })
      }
    })
  }
})

export const Score = () => {
  let highest = 0

  const text = pixiText({ text: `Score: ${0}`, anchor: { x: 0.5, y: 0.5 }, style: { fill: 0xFFFFFF, fontSize: 36, fontWeight: 'bold' } })

  const score = Entity<Position>({
    id: "score-display",
    components: {
      position: Position({ x: 150, y: 30, screenFixed: true }),
      renderable: Renderable({
        zIndex: 10,
        setContainer: async () => text,
        dynamic: ({ world }) => {
          const jumper = world.client?.playerCharacter()
          if (!jumper) return

          const height = ceil(-1 * jumper.components.position.data.y)

          if (height > highest) {
            highest = height
            text.text = `Score: ${highest}`
          }

          const screenWidth = world.renderer?.app.screen.width
          if (screenWidth) score.components.position.data.x = screenWidth / 2
        }
      })
    }
  })
  return score
}

const LeftBoundary = () => {
  const leftBoundary = Entity<Position>({
    id: "leftBoundary",
    components: {
      position: Position({ screenFixed: true }),
      debug: Debug(),
      renderable: Renderable({
        zIndex: 1,
        dynamic: ({ world }) => {
          const { x } = world.renderer!.camera.toCameraCoords({ x: 0, y: 0 })
          leftBoundary.components.position.setPosition({ x })
        },
        setContainer: async (r) => {
          return pixiGraphics().lineTo(0, 5000).stroke({ color: 0xffffff, width: 2, alpha: 0.5 })
        }
      })
    }
  })
  return leftBoundary
}

const RightBoundary = () => {
  const rightBoundary = Entity<Position>({
    id: "rightBoundary",
    components: {
      position: Position({ screenFixed: true }),
      debug: Debug(),
      renderable: Renderable({
        zIndex: 1,
        dynamic: ({ world }) => {
          const { x } = world.renderer!.camera.toCameraCoords({ x: 300, y: 0 })
          rightBoundary.components.position.setPosition({ x })
        },
        setContainer: async () => {
          return pixiGraphics().lineTo(0, 5000).stroke({ color: 0xffffff, width: 2, alpha: 0.5 })
        }
      })
    }
  })
  return rightBoundary
}

export const Jump: GameBuilder<JumpState> = {
  id: "jump",
  init: () => {
    // Generate 100 platforms immediately
    const platformEntities = []

    // Function to generate random x position
    const randomX = () => Math.floor(Math.random() * 250) + 25

    // Generate platforms with increasing height
    // First platform is directly under player spawn
    platformEntities.push(Platform(150, 20))

    // Generate remaining 99 platforms with increasing height
    for (let i = 1; i < 100; i++) {
      // Space platforms evenly, with some random offset
      const y = -50 * i + Math.floor(Math.random() * 30) - 15
      platformEntities.push(Platform(randomX(), y))
    }

    return {
      id: "jump",
      netcode: "rollback",
      state: {
        score: 0,
        highScore: 0,
        gameOver: false
      },
      systems: [
        SpawnSystem(Jumper),
        JumpSystem,
        CameraSystem({ follow: ({ y }) => ({ x: 150, y }) })
      ],
      bgColor: 0x87CEEB, // Sky blue background
      entities: [
        EscapeMenu(),
        Cursor(),
        Score(),
        LeftBoundary(),
        RightBoundary(),
        ...platformEntities,
      ]
    }
  }
}

const JumpSystem = SystemBuilder({
  id: "JumpSystem",
  init: (world) => {
    // Scale camera to fit the game
    const desiredScale = world.renderer?.app.screen.width! / 450
    const scaleBy = desiredScale - world.renderer?.camera.root.scale.x! - desiredScale * 0.1 - 0.2
    world.renderer?.camera.scaleBy(scaleBy)

    // Track highest player position
    let highestPlayerZ = 0

    return {
      id: "JumpSystem",
      query: [],
      priority: 9,
      onTick: () => {
        const state = world.game.state as JumpState
      }
    }
  }
})
