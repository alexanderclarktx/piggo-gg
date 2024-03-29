import { Command, InvokedAction } from "@piggo-gg/core";

type GameCommandAction = InvokedAction<"game", { game: string }>

export const GameCommand: Command<{ game: string }> = {
  id: "game",
  regex: /\/game (\w+)/,
  matcher: (world, match): GameCommandAction | undefined => {
    if (world.games[match[1]] && world.currentGame.id !== match[1]) return {
      action: "game",
      params: { game: match[1] }
    }
  },
  apply: ({params, world }) => {
    console.log("GameCommand", params);
    if (world.games[params.game] && world.currentGame.id !== params.game) {
      world.setGame(world.games[params.game]);
    }
  }
}
