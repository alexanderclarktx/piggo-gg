import { HUD, Chat, ConnectButton, Cursor, FullscreenButton, GameBuilder, Joystick, isMobile } from "@piggo-gg/core";

export const IsometricGame = <T extends string>(gameBuilder: GameBuilder<T>): GameBuilder<T> => ({
  ...gameBuilder,
  init: (world) => {
    const game = gameBuilder.init(world);

    if (world.runtimeMode === "client") {
      game.entities.push(FullscreenButton());

      isMobile() ?
        game.entities.push(Joystick(), ConnectButton()) :
        game.entities.push(Cursor(), Chat(), HUD(["Q", "E", "C", "X"], ["wall", "boost", "", ""]));
    }

    return game;
  }
});
