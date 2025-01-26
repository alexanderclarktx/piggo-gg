import {
  Background, SpawnSystem, GameBuilder, DefaultUI, Shop,
  InviteStone, Skelly, Entity, Position, pixiText, Renderable, pixiGraphics, World
} from "@piggo-gg/core"
import { FlappyCharacter } from "@piggo-gg/games"

export const Lobby: GameBuilder = {
  id: "lobby",
  init: (world) => ({
    id: "lobby",
    // systems: [SpawnSystem(Skelly)],
    systems: [],
    // view: "side",
    entities: [
      ...DefaultUI(world),
      Background({ img: "stars.png" }),

      Shop(),
      FriendList(world),

      InviteStone({ pos: { x: 0, y: -50 }, tint: 0xddddff })
    ]
  })
}


const FriendList = (world: World): Entity => {

  const outline = pixiGraphics()
  const title = pixiText({ text: "Friends", style: { fontSize: 32 }, pos: { x: 100, y: 5 }, anchor: { x: 0.5, y: 0 } })

  // let height = window.innerHeight
  let height = 0

  const drawOutline = () => {
    outline.clear()
    outline.rect(0, 0, 200, height - 20).stroke({ color: 0xffffff, alpha: 0.5, width: 2, miterLimit: 1 })
  }

  const friendList = Entity<Position | Renderable>({
    id: "friendList",
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
  return friendList
}