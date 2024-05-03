import { AbilityHUD, Chat, ConnectButton, DebugButton, FullscreenButton, GameBuilder, Joystick, Noob, isMobile } from "@piggo-gg/core";

export const IsometricGame = <T extends string>(g: GameBuilder<T>): GameBuilder<T> => ({
  ...g,
  init: (world) => {
    const game = g.init(world);

    if (world.runtimeMode === "client") {
      game.entities.push(Noob({ id: world.clientPlayerId! }));
      game.entities.push(FullscreenButton(), DebugButton(), Chat());

      isMobile() ?
        game.entities.push(Joystick(), ConnectButton()) :
        game.entities.push(AbilityHUD());
    }

    return game;
  }
});
