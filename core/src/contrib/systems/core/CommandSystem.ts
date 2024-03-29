import { World, InvokedAction, Action, ClientSystemBuilder } from "@piggo-gg/core";

export type Command<T extends {} = {}> = Action<T> & {
  id: string
  regex: RegExp
  matcher: (_: { world: World, match: RegExpMatchArray }) => InvokedAction | undefined
}

export const CommandSystem = ClientSystemBuilder({
  id: "CommandSystem",
  init: ({ world }) => {

    const processMessage = (message: string) => {
      Object.values(world.commands).forEach(({ regex, matcher }) => {
        const match = message.match(regex);
        if (match) {
          const action = matcher({ world, match });
          if (action) {
            world.actionBuffer.push(world.tick + 1, "world", action);
          }
        }
      });
    }

    return {
      id: "CommandSystem",
      query: [],
      onTick: () => {
        const messagesFromPlayer = world.chatHistory.atTick(world.tick);

        if (messagesFromPlayer) {
          Object.values(messagesFromPlayer).forEach((messages) => messages.forEach((message) => {
            processMessage(message);
          }));
        }
      }
    }
  }
})
