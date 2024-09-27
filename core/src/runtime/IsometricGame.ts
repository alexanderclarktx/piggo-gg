import { PvPHUD, Chat, ConnectButton, Cursor, FullscreenButton, GameBuilder, Joystick, isMobile, ShopButton, MobilePvPHUD } from "@piggo-gg/core";

export const IsometricGame = <T extends string>(gameBuilder: GameBuilder<T>): GameBuilder<T> => ({
  ...gameBuilder,
  init: (world) => {
    const game = gameBuilder.init(world);

    if (world.runtimeMode === "client") isMobile() ?
      game.entities.push(Joystick(), ShopButton()) :
      game.entities.push(FullscreenButton(), Cursor(), Chat());

    return game;
  }
});
