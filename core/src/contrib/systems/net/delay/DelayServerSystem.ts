import { System, DelayTickData, World } from "@piggo-gg/core";

export type DelayServerSystemProps = {
  world: World
  clients: Record<string, { send: (_: string) => number }>
  latestClientMessages: Record<string, { td: DelayTickData, latency: number }>
}

export const DelayServerSystem = ({ world, clients, latestClientMessages }: DelayServerSystemProps): System => {

  const sendMessage = () => {

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

  const handleMessage = () => {
    Object.keys(latestClientMessages).forEach((client) => {
      const messages = latestClientMessages[client];

      // process message actions
      if (messages.td.actions) {
        Object.keys(messages.td.actions).forEach((entityId) => {
          if (world.entities[entityId]?.components.controlled?.data.entityId === client) {
            world.actionBuffer.set(world.tick + 1, entityId, messages.td.actions[entityId]);
          }
        });
      }

      // process message chats
      if (messages.td.chats) {
        Object.keys(messages.td.chats).map(Number).forEach((tick) => {

          // add chats for the player
          Object.keys(messages.td.chats[tick]).forEach((entityId) => {
            if (entityId === client) {
              world.chatHistory.set(tick, entityId, messages.td.chats[entityId]);
            }
          });
        });
      }
    });
  }

  const onTick = () => {
    sendMessage();
    handleMessage();
  }

  return {
    id: "DelayServerSystem",
    onTick
  }
}
