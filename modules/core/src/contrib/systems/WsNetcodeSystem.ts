import { Entity, Game, SystemBuilder, Command, localCommandBuffer } from "@piggo-legends/core";

const SERVER_LOCAL = "wss://0.0.0.0:3000";
const SERVER_REMOTE = "wss://piggo-legends.up.railway.app";

export type TickData = {
  type: "game"
  tick: number
  player: string
  commands: Record<number, Record<string, Command>>
}

// WssNetcodeSystem handles networked entities over WebSockets
export const WsNetcodeSystem: SystemBuilder = ({ game, thisPlayerId }) => {
  const wsClient = new WebSocket(SERVER_LOCAL);
  // const wsClient = new WebSocket(SERVER_REMOTE);

  wsClient.onmessage = (event) => {
    const message = JSON.parse(event.data) as TickData;
    if (message.type === "game") {
      // console.log(`WsNetcodeSystem: received tick ${message.tick}`);
      // console.log(`${game.tick - message.tick}`);

      // fast-forward if we're behind
      if (message.tick > game.tick) {
        game.tick = message.tick + 5;
      }

      // rollback if message commands are different from local commands
      const localCommands = localCommandBuffer[message.tick];
      const messageCommands = message.commands[message.tick];
      let rollback = false;
      for (const [entityId, command] of Object.entries(messageCommands)) {
        if (!localCommands || localCommands[entityId] !== command) {
          console.log(`rollback ${entityId} ${command.actionId}`);
          // game.tick = message.tick - 1;
          rollback = true;
          break;
        }
      }

      // rewind to message tick and then fast-forward
      if (rollback) {
        console.log(`rollback from ${message.tick}`);
        // game.tick = message.tick - 1;
        localCommandBuffer[message.tick] = message.commands[message.tick];
        game.rollback(message.tick, 5);
      }

      console.log(Object.entries(message.commands[message.tick]));
    }
  }

  const onTick = (_: Entity[]) => {
    sendMessage(game);
  }

  const sendMessage = (game: Game) => {
    // construct tick message
    const message: TickData = {
      type: "game",
      tick: game.tick,
      player: thisPlayerId,
      commands: localCommandBuffer
    }

    if (wsClient.readyState === wsClient.OPEN) wsClient.send(JSON.stringify(message));
  }

  return {
    componentTypeQuery: ["networked"],
    onTick
  }
}
