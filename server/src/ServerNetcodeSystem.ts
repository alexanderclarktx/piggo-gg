import { TickData } from "@piggo-legends/contrib";
import { Game, System } from "@piggo-legends/core";
import { ServerWebSocket } from "bun";

export type ServerNetcodeSystemProps = {
  game: Game
  clients: Record<string, ServerWebSocket<unknown>>
}

export const ServerNetcodeSystem = ({ game, clients }: ServerNetcodeSystemProps): System => {

  const onTick = () => {
    // build tick data
    const tickData: TickData = {
      commands: [],
      player: "server",
      tick: game.tick,
      type: "game"
    };

    // send tick data to all clients
    Object.values(clients).forEach((client) => {
      client.send(JSON.stringify(tickData));
    });
  }

  return {
    componentTypeQuery: ["none"],
    onTick
  }
}
