import { AbilityHUD, Chat, ConnectButton, Cursor, FullscreenButton, GameBuilder, Joystick, Scoreboard, isMobile } from "@piggo-gg/core";

export const IsometricGame = <T extends string>(gameBuilder: GameBuilder<T>): GameBuilder<T> => ({
  ...gameBuilder,
  init: (world) => {
    const game = gameBuilder.init(world);

    if (world.runtimeMode === "client") {
      game.entities.push(FullscreenButton(), Chat(), Scoreboard());

      isMobile() ?
        game.entities.push(Joystick(), ConnectButton()) :
        game.entities.push(Cursor(), AbilityHUD(["Q", "E", "C", "X"], ["wall", "boost", "", ""]));
    }

    return game;
  }
});
