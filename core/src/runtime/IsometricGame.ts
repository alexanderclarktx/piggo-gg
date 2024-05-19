import { AbilityHUD, Chat, ConnectButton, Cursor, DebugButton, FullscreenButton, GameBuilder, Joystick, Noob, PlayerTable, isMobile } from "@piggo-gg/core";

export const IsometricGame = <T extends string>(gameBuilder: GameBuilder<T>): GameBuilder<T> => ({
  ...gameBuilder,
  init: (world) => {
    const game = gameBuilder.init(world);

    if (world.runtimeMode === "client") {
      game.entities.push(FullscreenButton(), Chat(), PlayerTable());

      isMobile() ?
        game.entities.push(Joystick(), ConnectButton()) :
        game.entities.push(AbilityHUD(), Cursor());
    }

    return game;
  }
});
