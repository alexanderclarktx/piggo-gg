import { System, TickData, World } from "@piggo-gg/core";

export type ServerNetcodeSystemProps = {
  world: World
  clients: Record<string, { send: (_: string) => number }>
  clientMessages: Record<string, { td: TickData, latency: number }>
}

export const WsServerSystem = ({ world, clients, clientMessages }: ServerNetcodeSystemProps): System => {

  const onTick = () => {

    // prepare actions & messages for this tick + future ticks
    const frames = world.actionBuffer.keys().filter((tick) => tick >= world.tick);
    let actions: Record<number, Record<string, string[]>> = {};
    let chats: Record<number, Record<string, string[]>> = {};

    frames.forEach((tick) => {
      const actionsAtTick = world.actionBuffer.atTick(tick);
      if (actionsAtTick && Object.keys(actionsAtTick).length) {
        actions[tick] = actionsAtTick;
      }

      const messagesAtTick = world.chatHistory.atTick(tick);
      if (messagesAtTick && Object.keys(messagesAtTick).length) {
        chats[tick] = messagesAtTick;
      }
    });

    // build tick data
    const tickData: TickData = {
      type: "game",
      player: "server",
      tick: world.tick,
      timestamp: Date.now(),
      serializedEntities: world.entitiesAtTick[world.tick],
      actions,
      chats
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
