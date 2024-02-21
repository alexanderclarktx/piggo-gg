import { System, TickData, World } from "@piggo-legends/core";
import { ServerWebSocket } from "bun";

export type ServerNetcodeSystemProps = {
  world: World
  clients: Record<string, ServerWebSocket<unknown>>
}

export const WsServerSystem = ({ world, clients }: ServerNetcodeSystemProps): System => {

  const onTick = () => {

    // if (world.tick % 500 === 0) console.log(serializedEntities);

    // build tick data
    const tickData: TickData = {
      type: "game",
      player: "server",
      tick: world.tick,
      timestamp: Math.round(performance.now()),
      serializedEntities: world.entitiesAtTick[world.tick],
      commands: {[world.tick]: world.localCommandBuffer[world.tick]}
    };

    // send tick data to all clients
    Object.values(clients).forEach((client) => {
      client.send(JSON.stringify(tickData));
    });
  }

  return {
    id: "WsServerSystem",
    onTick
  }
}
