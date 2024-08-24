import { HUD, Chat, ConnectButton, Cursor, FullscreenButton, GameBuilder, Joystick, isMobile, MobileHUD } from "@piggo-gg/core";

export const IsometricGame = <T extends string>(gameBuilder: GameBuilder<T>): GameBuilder<T> => ({
  ...gameBuilder,
  init: (world) => {
    const game = gameBuilder.init(world);

    if (world.runtimeMode === "client") isMobile() ?
      game.entities.push(Joystick(), ConnectButton(), MobileHUD()) :
      game.entities.push(FullscreenButton(), Cursor(), Chat(), HUD(["Q", "E", "C", "X"], ["wall", "boost", "", ""]));

    return game;
  }
});
