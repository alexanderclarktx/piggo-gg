import {
  Background,
  SpawnSystem, GameBuilder, DefaultUI,
  Shop
} from "@piggo-gg/core"
import { FlappyCharacter } from "@piggo-gg/games"

export const Menu: GameBuilder = {
  id: "menu",
  init: (world) => ({
    id: "menu",
    systems: [SpawnSystem(FlappyCharacter)],
    view: "side",
    entities: [
      ...DefaultUI(world),
      Background({ img: "stars.png" }),

      Shop()

      

      // InviteStone({ pos: { x: 32 * 1, y: 32 * 3.25 }, tint: 0xddddff }),
    ]
  })
}
