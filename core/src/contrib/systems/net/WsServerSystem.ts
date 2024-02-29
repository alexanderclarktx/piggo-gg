import { System, TickData, World } from "@piggo-legends/core";

export type ServerNetcodeSystemProps = {
  world: World
  clients: Record<string, { send: (_: string) => number}>
  clientMessages: Record<string, { td: TickData, latency: number }>
}

export const WsServerSystem = ({ world, clients, clientMessages }: ServerNetcodeSystemProps): System => {

  const onTick = () => {

    // send actions for this tick and any future ticks
    const frames = Object.keys(world.actionBuffer).map(Number).filter((tick) => tick >= world.tick);
    let actions: Record<number, Record<string, string[]>> = {};
    frames.forEach((tick) => {
      if (Object.keys(world.actionBuffer.buffer[tick]).length) {
        actions[tick] = world.actionBuffer.buffer[tick];
      }
    });

    // build tick data
    const tickData: TickData = {
      type: "game",
      player: "server",
      tick: world.tick,
      timestamp: Date.now(),
      serializedEntities: world.entitiesAtTick[world.tick],
      actions
    };

    // send tick data to all clients
    Object.entries(clients).forEach(([id, client]) => {
      client.send(JSON.stringify({
        ...tickData,
        latency: clientMessages[id]?.latency,
      }));
    })
  }

  return {
    id: "WsServerSystem",
    onTick
  }
}
