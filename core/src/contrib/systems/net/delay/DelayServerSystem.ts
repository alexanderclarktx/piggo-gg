import { System, DelayTickData, World } from "@piggo-gg/core";

export type DelayServerSystemProps = {
  world: World
  clients: Record<string, { send: (_: string) => number }>
  latestClientMessages: Record<string, { td: DelayTickData, latency: number }[]>
}

// delay netcode server
export const DelayServerSystem = ({ world, clients, latestClientMessages }: DelayServerSystemProps): System => {

  let lastTickSent = 0;

  const sendMessage = () => {

    // build tick data
    const tickData: DelayTickData = {
      actions: world.actionBuffer.atTick(world.tick) ?? {},
      chats: world.chatHistory.atTick(world.tick) ?? {},
      game: world.currentGame.id,
      player: "server",
      serializedEntities: world.entitiesAtTick[world.tick] ?? {},
      tick: world.tick,
      timestamp: Date.now(),
      type: "game"
    }

    if (world.tick > (lastTickSent + 1)) console.log("skipped ticks!", world.tick - lastTickSent);
    lastTickSent = world.tick;

    // send tick data to all clients
    Object.entries(clients).forEach(([id, client]) => {
      client.send(JSON.stringify({
        ...tickData,
        latency: latestClientMessages[id]?.at(-1)?.latency,
      }));

      if (latestClientMessages[id] && latestClientMessages[id].length > 2) {
        latestClientMessages[id].shift();
        latestClientMessages[id].shift();
      } else {
        latestClientMessages[id]?.shift();
      }
    })
  }

  const handleMessage = () => {
    Object.keys(latestClientMessages).forEach((client) => {
      if (world.tick % 100 === 0) console.log("messages", latestClientMessages[client].length);

      let messages: ({ td: DelayTickData, latency: number } | undefined)[];

      if (latestClientMessages[client].length > 2) {
        messages = [latestClientMessages[client][0], latestClientMessages[client][1]]
      } else {
        messages = [latestClientMessages[client][0]]
      }
      if (messages.length === 0) return;

      messages.forEach((message) => {
        if (!message) return;

        // process message actions
        if (message.td.actions) {
          Object.keys(message.td.actions).forEach((entityId) => {
            if (entityId === "world" || world.entities[entityId]?.components.controlled?.data.entityId === client) {
              message.td.actions[entityId].forEach((action) => {
                world.actionBuffer.push(world.tick, entityId, action);
              });
            }
          });
        }

        // process message chats
        if (message.td.chats[client]) {
          world.chatHistory.set(world.tick, client, message.td.chats[client]);
        }
      });
    });
  }

  const onTick = () => {
    handleMessage();
    sendMessage();
  }

  return {
    id: "DelayServerSystem",
    onTick
  }
}
