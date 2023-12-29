import { Entity, Game, SystemBuilder, SystemProps } from "@piggo-legends/core";
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

export type WsNetcodeSystemProps = SystemProps & {
  thisPlayerId: string
}

// WssNetcodeSystem handles networked entities over WebSockets
export const WsNetcodeSystem: SystemBuilder<WsNetcodeSystemProps> = ({ game, thisPlayerId }) => {
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
