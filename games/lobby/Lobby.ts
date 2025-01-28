import {
  Background, SpawnSystem, GameBuilder, DefaultUI, InviteStone,
  Entity, Position, pixiText, Renderable, pixiGraphics, World,
  Animal, LineWall
} from "@piggo-gg/core"

export const Lobby: GameBuilder = {
  id: "lobby",
  init: (world) => ({
    id: "lobby",
    systems: [SpawnSystem(Animal)],
    view: "side",
    entities: [
      ...DefaultUI(world),
      Background({ img: "stars.png" }),

      Letterbox(),
      Letterbox(-220),
      Friends(world),
      Profile(),

      Platform(-250, 50),
      Platform(-300, 150),
      Platform(-400, 100),
      Platform(-100, 50),
      Platform(0, 0),
      Platform(100, -50),
      Platform(200, -100),
      Platform(300, -150),

      Floor(),

      InviteStone({ pos: { x: 0, y: -50 }, tint: 0xddddff })
    ]
  })
}

const Platform = (x: number, y: number) => {
  return LineWall({
    position: { x, y },
    points: [0, 0, 0, 20, 100, 20, 100, 0, 0, 0],
    visible: true
  })
}

const Floor = () => LineWall({ points: [-1000, 200, 10000, 200], visible: true })

// covers the screen with black
const Letterbox = (x: number = 0, width: number = 220) => Entity({
  id: `letterbox-${x}-${width}`,
  components: {
    position: Position({ x, y: 0, screenFixed: true }),
    renderable: Renderable({
      zIndex: 9,
      setup: async (r) => {
        const g = pixiGraphics()
        g.rect(0, 0, width, 3000).fill({ color: 0x000000, alpha: 1 })
        r.c.addChild(g)
      }
    })
  }
})

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

const Friends = (world: World): Entity => {

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
        dynamic: () => {
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
