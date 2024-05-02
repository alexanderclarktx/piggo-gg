import { Command, InvokedAction } from "@piggo-gg/core";

type GameCommandParams = { game: string }
type GameCommandAction = InvokedAction<"game", GameCommandParams>

export const GameCommand: Command<GameCommandParams> = {
  id: "game",
  regex: /\/game (\w+)/,
  parse: ({ world, match }): GameCommandAction | undefined => {
    if (world.games[match[1]] && world.currentGame.id !== match[1]) return {
      action: "game",
      params: { game: match[1] }
    }
  },
  invoke: ({ params, world }) => {
    console.log("GameCommand", params);
    if (world.games[params.game] && world.currentGame.id !== params.game) {
      world.setGame(world.games[params.game]);
    }
  }
}
