import { Entity, Game, SystemBuilder, Command, SerializedPosition, localCommandBuffer } from "@piggo-legends/core";

export type TickData = {
  type: "game"
  tick: number
  player: string
  commands: Command[]
}

export type SerializedEntity = {
  position?: SerializedPosition
}

// WssNetcodeSystem handles networked entities over WebSockets
export const WsNetcodeSystem: SystemBuilder = ({ game, thisPlayerId }) => {
  const wsClient = new WebSocket("ws://localhost:3000");

  wsClient.onmessage = (event) => {
    const message = JSON.parse(event.data) as TickData;
    if (message.type === "game") {
      // console.log(`WsNetcodeSystem: received tick ${message.tick}`);
      // localCommandBuffer = localCommandBuffer.filter((c) => c.tick !== message.tick);
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
