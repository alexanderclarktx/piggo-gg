import { Entity, Game, GameProps, System } from "@piggo-legends/core";
import { Command, SerializedPosition, localCommandBuffer } from "@piggo-legends/contrib";

export type TickData = {
  type: "game"
  tick: number
  player: string
  commands: Command[]
}

export type SerializedEntity = {
  position?: SerializedPosition
}

export type WsNetcodeSystemProps = {
  thisPlayerId: string
}

// WssNetcodeSystem handles networked entities over WebSockets
export const WsNetcodeSystem = ({ thisPlayerId }: WsNetcodeSystemProps): System => {
  const wsClient = new WebSocket("ws://localhost:3000");

  wsClient.onmessage = (event) => {
    const message = JSON.parse(event.data) as TickData;
    if (message.type === "game") {
      // console.log(`WsNetcodeSystem: received tick ${message.tick}`);
      // localCommandBuffer = localCommandBuffer.filter((c) => c.tick !== message.tick);
    }
  }

  const onTick = (_: Entity[], game: Game<GameProps>) => {
    sendMessage(game);
  }

  const sendMessage = (game: Game<GameProps>) => {
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
