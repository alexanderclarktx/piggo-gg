import {
  GameBuilder, DefaultUI, InviteStone, Entity,
  Position, pixiText, Renderable, pixiGraphics, World
} from "@piggo-gg/core"

export const Lobby: GameBuilder = {
  id: "lobby",
  init: (world) => ({
    id: "lobby",
    systems: [],
    view: "side",
    entities: [
      ...DefaultUI(world),

      Friends(),
      Profile(),
      GameLobby(),

      InviteStone({ pos: { x: 300, y: 50 }, tint: 0xddddff })
    ]
  })
}

const GameLobby = (): Entity => {
  const title = pixiText({ text: "Game Lobby", style: { fontSize: 38 }, pos: { x: 10, y: 10 }, anchor: { x: 0, y: 0 } })

  let height = 0

  const gameLobby = Entity<Position | Renderable>({
    id: "gameLobby",
    components: {
      position: Position({ x: 10, y: 10, screenFixed: true }),
      renderable: Renderable({
        zIndex: 10,
        dynamic: ({ world }) => {
          if (height !== world.renderer!.app.screen.height) {
            height = world.renderer!.app.screen.height
          }
        },
        setup: async (r) => {
          r.c.addChild(title)
        }
      })
    }
  })
  return gameLobby
}

const Profile = (): Entity => {
  const outline = pixiGraphics()
  const title = pixiText({ text: "Profile", style: { fontSize: 32 }, pos: { x: 100, y: 5 }, anchor: { x: 0.5, y: 0 } })

  const drawOutline = () => {
    outline.clear()
    outline.rect(0, 0, 200, 170).stroke({ color: 0xffffff, alpha: 0.5, width: 2, miterLimit: 1 })
  }

  const profile = Entity<Position | Renderable>({
    id: "profile",
    components: {
      position: Position({ x: 10, y: -180, screenFixed: true }),
      renderable: Renderable({
        zIndex: 10,
        setup: async (r) => {
          drawOutline()
          r.c.addChild(outline, title)
        }
      })
    }
  })
  return profile
}

const Friends = (): Entity => {

  const outline = pixiGraphics()
  const title = pixiText({ text: "Friends", style: { fontSize: 32 }, pos: { x: 100, y: 5 }, anchor: { x: 0.5, y: 0 } })

  let height = 0

  const drawOutline = () => {
    outline.clear()
    outline.rect(0, 0, 200, height - 200).stroke({ color: 0xffffff, alpha: 0.5, width: 2, miterLimit: 1 })
  }

  const friends = Entity<Position | Renderable>({
    id: "friends",
    components: {
      position: Position({ x: 10, y: 10, screenFixed: true }),
      renderable: Renderable({
        zIndex: 10,
        dynamic: ({ world }) => {
          if (height !== world.renderer!.app.screen.height) {
            height = world.renderer!.app.screen.height
            drawOutline()
          }
        },
        setup: async (r) => {
          drawOutline()
          r.c.addChild(outline, title)
        }
      })
    }
  })
  return friends
}
