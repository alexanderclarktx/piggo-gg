import {
  Background, SpawnSystem, GameBuilder, DefaultUI, Shop,
  InviteStone,
  Skelly
} from "@piggo-gg/core"
import { FlappyCharacter } from "@piggo-gg/games"

export const Lobby: GameBuilder = {
  id: "lobby",
  init: (world) => ({
    id: "lobby",
    systems: [SpawnSystem(Skelly)],
    // view: "side",
    entities: [
      ...DefaultUI(world),
      Background({ img: "stars.png" }),

      Shop(),
      

      InviteStone({ pos: { x: 0, y: -50 }, tint: 0xddddff }),
    ]
  })
}
