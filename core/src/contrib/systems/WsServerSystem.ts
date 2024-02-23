import { System, TickData, World } from "@piggo-legends/core";

export type ServerNetcodeSystemProps = {
  world: World
  clients: Record<string, { send: (_: string) => number}>
}

export const WsServerSystem = ({ world, clients }: ServerNetcodeSystemProps): System => {

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
      timestamp: Math.round(Date.now()),
      serializedEntities: world.entitiesAtTick[world.tick],
      commands
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
