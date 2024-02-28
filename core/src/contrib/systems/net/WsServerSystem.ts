import { System, TickData, World } from "@piggo-legends/core";

export type ServerNetcodeSystemProps = {
  world: World
  clients: Record<string, { send: (_: string) => number}>
  clientMessages: Record<string, { td: TickData, latency: number }>
}

export const WsServerSystem = ({ world, clients, clientMessages }: ServerNetcodeSystemProps): System => {

  const onTick = () => {

    // if (world.tick % 500 === 0) console.log(serializedEntities);

    // send commands for this tick and any future ticks
    const frames = Object.keys(world.localCommandBuffer).map(Number).filter((tick) => tick >= world.tick);
    let commands: Record<number, Record<string, string[]>> = {};
    frames.forEach((tick) => {
      if (Object.keys(world.localCommandBuffer[tick]).length) {
        commands[tick] = world.localCommandBuffer[tick];
      }
    });

    // build tick data
    const tickData: TickData = {
      type: "game",
      player: "server",
      tick: world.tick,
      timestamp: Date.now(),
      serializedEntities: world.entitiesAtTick[world.tick],
      commands
    };

    // send tick data to all clients
    Object.entries(clients).forEach(([id, client]) => {
      client.send(JSON.stringify({
        ...tickData,
        latency: clientMessages[id]?.latency,
        // lastReceivedMessage: {
        //   tick: clientMessages[id]?.td.tick,
        //   timestamp: clientMessages[id]?.td.timestamp,
        //   localTimestamp: clientMessages[id]?.localTimestamp
        // }
      }));
    })
  }

  return {
    id: "WsServerSystem",
    onTick
  }
}
