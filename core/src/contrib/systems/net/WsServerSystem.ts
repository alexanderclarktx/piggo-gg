import { System, TickData, World } from "@piggo-gg/core";

export type ServerNetcodeSystemProps = {
  world: World
  clients: Record<string, { send: (_: string) => number }>
  clientMessages: Record<string, { td: TickData, latency: number }>
}

export const WsServerSystem = ({ world, clients, clientMessages }: ServerNetcodeSystemProps): System => {

  const onTick = () => {

    // send actions for this tick and any future ticks
    const frames = world.actionBuffer.keys().filter((tick) => tick >= world.tick);
    let actions: Record<number, Record<string, string[]>> = {};
    frames.forEach((tick) => {
      const actionsAtTick = world.actionBuffer.atTick(tick);
      if (actionsAtTick && Object.keys(actionsAtTick).length)
        actions[tick] = actionsAtTick;
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
