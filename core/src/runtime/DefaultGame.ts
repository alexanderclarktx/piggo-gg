import { Chat, Cursor, FullscreenButton, GameBuilder, isMobile, Joystick } from "@piggo-gg/core"

export const DefaultGame = <T extends string>(gameBuilder: GameBuilder<T>): GameBuilder<T> => ({
  ...gameBuilder,
  init: (world) => {
    const game = gameBuilder.init(world)

    if (world.runtimeMode === "client") {
      isMobile() ?
        game.entities.push(Joystick()) :
        game.entities.push(FullscreenButton(), Cursor(), Chat())
    }

    return game
  }
})
