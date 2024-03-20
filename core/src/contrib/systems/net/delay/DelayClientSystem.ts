import { Entity, SystemBuilder, DelayTickData, World, Ball, Noob, Skelly, Zombie, SerializedEntity } from "@piggo-gg/core";

const servers = {
  dev: "ws://localhost:3000",
  staging: "wss://piggo-api-staging.up.railway.app",
  production: "wss://api.piggo.gg"
} as const;

// WssNetcodeSystem handles networked entities over WebSockets
export const DelayClientSystem: SystemBuilder<"DelayClientSystem"> = ({
  id: "DelayClientSystem",
  init: ({ world, clientPlayerId }) => {
    const wsClient = new WebSocket(servers.production);
    // const wsClient = new WebSocket(servers.staging);
    // const wsClient = new WebSocket(servers.dev);

    let lastLatency = 0;
    let serverMessageBuffer: DelayTickData[] = [];

    setInterval(() => {
      (lastMessageTick && ((world.tick - lastMessageTick) < 500)) ? world.isConnected = true : world.isConnected = false;
    }, 200);

    let lastMessageTick: number = 0;
    // let latestServerMessage: DelayTickData | null = null;

    wsClient.onmessage = (event) => {
      const message = JSON.parse(event.data) as DelayTickData;

      // TODO buffer messages from server
      if (message.tick < lastMessageTick) return;

      // store latest message
      serverMessageBuffer.push(message);
      // latestServerMessage = message;
      lastMessageTick = message.tick;

      // record latency
      lastLatency = Date.now() - message.timestamp;

      if (message.latency) world.ms = (lastLatency + message.latency) / 2;
    }

    const onTick = (_: Entity[]) => {
      sendMessage(world);
      handleLatestMessage();
      // serverMessageBuffer.shift();
      // latestServerMessage = null;
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

      if (wsClient.readyState === wsClient.OPEN) wsClient.send(JSON.stringify(message));

      world.actionBuffer.clearTick(world.tick + 1);
    }

    const handleLatestMessage = () => {

      console.log("serverMessageBuffer", serverMessageBuffer.length);

      if (serverMessageBuffer.length === 0) {
        // world.tick = world.tick - 1;
        world.skipNextTick = true;
        return;
      }

      if (serverMessageBuffer.length > 2) {
        world.tickFaster = true;
        // serverMessageBuffer.shift();
      } else {
        world.tickFaster = false;
      }

      let message = serverMessageBuffer.shift() as DelayTickData;

      // remove old local entities
      Object.keys(world.entities).forEach((entityId) => {
        if (world.entities[entityId]?.components.networked) {

          if (!message.serializedEntities[entityId]) {
            // delete if not present in rollback frame
            console.log("DELETE ENTITY", entityId, message.serializedEntities);
            world.removeEntity(entityId);
          }
        }
      });

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

      let rollback = false;

      const mustRollback = (reason: string) => {
        console.log("MUST ROLLBACK", reason);
        rollback = true;
      }

      if ((message.tick - 1) !== world.tick) mustRollback("old tick");

      const sre: Record<string, SerializedEntity> = {}
      for (const entityId in world.entities) {
        if (world.entities[entityId].components.networked) {
          sre[entityId] = world.entities[entityId].serialize();
        }
      }

      // compare entity counts
      if (!rollback && world.entitiesAtTick[message.tick]) {
        if (Object.keys(sre).length !== Object.keys(message.serializedEntities).length) {
          mustRollback(`entity count local:${Object.keys(sre).length} remote:${Object.keys(message.serializedEntities).length}`);
        }
      }

      // compare entity states
      if (!rollback) {
        Object.entries(message.serializedEntities).forEach(([entityId, msgEntity]) => {
          const localEntity = sre[entityId];
          if (localEntity) {
            if (entityId.startsWith("skelly") && entityId !== `skelly-${clientPlayerId}`) return;
            if (JSON.stringify(localEntity) !== JSON.stringify(msgEntity)) {
              mustRollback(`entity state ${entityId} local:${JSON.stringify(localEntity)}\nremote:${JSON.stringify(msgEntity)}`);
            }
          } else {
            mustRollback(`no buffered message ${sre.serializedEntities}`);
          }
        });
      }

      if (rollback) {
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
        // console.log("set actions", entityId, actions);
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
