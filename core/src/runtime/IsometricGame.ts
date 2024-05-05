import { AbilityHUD, Chat, ConnectButton, DebugButton, FullscreenButton, GameBuilder, Joystick, Noob, isMobile } from "@piggo-gg/core";

export const IsometricGame = <T extends string>(gameBuilder: GameBuilder<T>): GameBuilder<T> => ({
  ...gameBuilder,
  init: (world) => {
    const game = gameBuilder.init(world);

    if (world.runtimeMode === "client") {
      game.entities.push(Noob({ id: world.client!.playerId }));
      game.entities.push(FullscreenButton(), DebugButton(), Chat());

      isMobile() ?
        game.entities.push(Joystick(), ConnectButton()) :
        game.entities.push(AbilityHUD());
    }

    return game;
  }
});
