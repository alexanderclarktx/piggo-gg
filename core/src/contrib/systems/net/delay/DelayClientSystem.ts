import { Entity, SystemBuilder, DelayTickData, World, Ball, Noob, Skelly, Zombie } from "@piggo-gg/core";

const servers = {
  dev: "ws://localhost:3000",
  staging: "wss://piggo-api-staging.up.railway.app",
  production: "wss://api.piggo.gg"
} as const;

// WssNetcodeSystem handles networked entities over WebSockets
export const DelayClientSystem: SystemBuilder<"DelayClientSystem"> = ({
  id: "DelayClientSystem",
  init: ({ world, clientPlayerId }) => {
    // const wsClient = new WebSocket(servers.production);
    // const wsClient = new WebSocket(servers.staging);
    const wsClient = new WebSocket(servers.dev);

    let lastLatency = 0;

    setInterval(() => {
      (lastMessageTick && ((world.tick - lastMessageTick) < 500)) ? world.isConnected = true : world.isConnected = false;
    }, 200);

    let lastMessageTick: number = 0;
    let latestServerMessage: DelayTickData | null = null;

    wsClient.onmessage = (event) => {
      const message = JSON.parse(event.data) as DelayTickData;

      // ignore messages from the past
      // if (latestServerMessage && (message.tick < latestServerMessage.tick)) return;
      if (message.tick < lastMessageTick) return;

      // store latest message
      latestServerMessage = message;
      lastMessageTick = message.tick;

      // record latency
      lastLatency = Date.now() - message.timestamp;
      if (message.latency) world.ms = (lastLatency + message.latency) / 2;
    }

    const onTick = (_: Entity[]) => {
      sendMessage(world);
      handleLatestMessage();
      latestServerMessage = null;
    }

    const sendMessage = (world: World) => {

      const message: DelayTickData = {
        type: "game",
        tick: world.tick,
        timestamp: Date.now(),
        player: clientPlayerId ?? "unknown",
        actions: world.actionBuffer.atTick(world.tick + 1) ?? {},
        chats: world.chatHistory.atTick(world.tick) ?? {},
        serializedEntities: {}
      }

      // console.log("send", message);

      if (wsClient.readyState === wsClient.OPEN) wsClient.send(JSON.stringify(message));

      world.actionBuffer.clearTick(world.tick + 1);
    }

    const handleLatestMessage = () => {
      if (latestServerMessage === null) return;
      let message = latestServerMessage;

      // add new entities if not present locally
      Object.keys(message.serializedEntities).forEach((entityId) => {
        if (!world.entities[entityId]) {
          if (entityId.startsWith("zombie")) {
            world.addEntity(Zombie({ id: entityId }));
          } else if (entityId.startsWith("ball")) {
            world.addEntity(Ball({ id: entityId }));
          } else if (entityId.startsWith("noob")) {
            world.addEntity(Noob({ id: entityId }))
          } else if (entityId.startsWith("skelly")) {
            world.addEntity(Skelly(entityId));
          } else {
            console.error("UNKNOWN ENTITY ON SERVER", entityId);
          }
        }
      });

      // console.log("hm", lastMessageTick, world.tick);
      if ((lastMessageTick - world.tick) > 1) {
        world.tick = message.tick - 1;
        Object.keys(message.serializedEntities).forEach((entityId) => {
          if (world.entities[entityId]) {
            // console.log("deserialize", entityId, message.serializedEntities[entityId]);
            world.entities[entityId].deserialize(message.serializedEntities[entityId]);
          }
        });
      }

      // set actions
      Object.entries(message.actions).forEach(([entityId, actions]) => {
        console.log("set actions", entityId, actions);
        world.actionBuffer.set(message.tick, entityId, actions);
      });

      // handle new chat messages
      const numChats = Object.keys(message.chats).length;
      if (numChats) {
        Object.keys(message.chats).map(Number).forEach((tick) => {
          Object.keys(message.chats[tick]).forEach((entityId) => {
            world.chatHistory.set(tick, entityId, message.chats[entityId]);
          });
        });
      }
    }

    return {
      id: "DelayClientSystem",
      query: ["networked"],
      onTick,
      skipOnRollback: true
    }
  }
});
