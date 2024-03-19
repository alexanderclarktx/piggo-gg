import { System, DelayTickData, World } from "@piggo-gg/core";

export type DelayServerSystemProps = {
  world: World
  clients: Record<string, { send: (_: string) => number }>
  latestClientMessages: Record<string, { td: DelayTickData, latency: number }>
}

export const DelayServerSystem = ({ world, clients, latestClientMessages }: DelayServerSystemProps): System => {

  const onTick = () => {

    // build tick data
    const tickData: DelayTickData = {
      type: "game",
      player: "server",
      tick: world.tick,
      timestamp: Date.now(),
      serializedEntities: world.entitiesAtTick[world.tick - 1],
      actions: world.actionBuffer.atTick(world.tick) ?? {},
      chats: world.chatHistory.atTick(world.tick) ?? {}
    };

    // send tick data to all clients
    Object.entries(clients).forEach(([id, client]) => {
      client.send(JSON.stringify({
        ...tickData,
        latency: latestClientMessages[id]?.latency,
      }));
    })
  }

  return {
    id: "DelayServerSystem",
    onTick
  }
}
