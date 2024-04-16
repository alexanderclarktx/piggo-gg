import { Entity, SystemBuilder, DelayTickData, World, Ball, Noob, Skelly, Zombie, SerializedEntity } from "@piggo-gg/core";

const servers = {
  dev: "ws://localhost:3000",
  staging: "wss://piggo-api-staging.up.railway.app",
  production: "wss://api.piggo.gg"
} as const;

// delay netcode client
export const DelayClientSystem: SystemBuilder<"DelayClientSystem"> = ({
  id: "DelayClientSystem",
  init: ({ world, clientPlayerId }) => {
    // const wsClient = new WebSocket(servers.production);
    // const wsClient = new WebSocket(servers.staging);
    const wsClient = new WebSocket(servers.dev);

    let serverMessageBuffer: DelayTickData[] = [];
    let lastLatency = 0;

    setInterval(() => {
      (lastMessageTick && ((world.tick - lastMessageTick) < 500)) ? world.isConnected = true : world.isConnected = false;
    }, 200);

    let lastMessageTick: number = 0;

    wsClient.onmessage = (event) => {
      const message = JSON.parse(event.data) as DelayTickData;

      // skip old messages
      if (message.tick < lastMessageTick) return;

      // store latest message
      serverMessageBuffer.push(message);
      lastMessageTick = message.tick;

      // record latency
      lastLatency = Date.now() - message.timestamp;
      if (message.latency) world.ms = (lastLatency + message.latency) / 2;

      // set flag to green
      world.tickFlag = "green";
    }

    const onTick = (_: Entity[]) => {
      sendMessage(world);
      handleLatestMessage();
    }

    const sendMessage = (world: World) => {

      const message: DelayTickData = {
        actions: world.actionBuffer.atTick(world.tick + 1) ?? {},
        chats: world.chatHistory.atTick(world.tick) ?? {},
        game: world.currentGame.id,
        player: clientPlayerId ?? "unknown",
        serializedEntities: {},
        tick: world.tick,
        timestamp: Date.now(),
        type: "game"
      }

      if (wsClient.readyState === wsClient.OPEN) wsClient.send(JSON.stringify(message));

      world.actionBuffer.clearTick(world.tick + 1);
    }

    const handleLatestMessage = () => {

      if (serverMessageBuffer.length === 0) return;

      if (serverMessageBuffer.length > 10) {
        serverMessageBuffer = [];
        return;
      }

      if (serverMessageBuffer.length > 2) {
        world.tickFaster = true;
      } else {
        world.tickFaster = false;
      }

      let message = serverMessageBuffer.shift() as DelayTickData;

      // remove old local entities
      Object.keys(world.entities).forEach((entityId) => {
        if (world.entities[entityId]?.components.networked) {

          if (!message.serializedEntities[entityId]) {
            console.log("DELETE ENTITY", entityId, message.serializedEntities);
            world.removeEntity(entityId);
          }
        }
      });

      // TODO refactor use a table of entities
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

      if ((message.tick - 1) !== world.tick) mustRollback(`old tick world=${world.tick} msg=${message.tick}`);

      const localEntities: Record<string, SerializedEntity> = {}
      for (const entityId in world.entities) {
        if (world.entities[entityId].components.networked) {
          localEntities[entityId] = world.entities[entityId].serialize();
        }
      }

      // compare entity counts
      if (!rollback) {
        if (Object.keys(localEntities).length !== Object.keys(message.serializedEntities).length) {
          mustRollback(`entity count local:${Object.keys(localEntities).length} remote:${Object.keys(message.serializedEntities).length}`);
        }
      }

      // compare entity states
      if (!rollback) {
        Object.entries(message.serializedEntities).forEach(([entityId, msgEntity]) => {
          const localEntity = localEntities[entityId];
          if (localEntity) {
            if (entityId.startsWith("skelly") && entityId !== `skelly-${clientPlayerId}`) return;
            if (JSON.stringify(localEntity) !== JSON.stringify(msgEntity)) {
              mustRollback(`entity state ${entityId} local:${JSON.stringify(localEntity)}\nremote:${JSON.stringify(msgEntity)}`);
            }
          } else {
            mustRollback(`no buffered message ${localEntities.serializedEntities}`);
          }
        });
      }

      if (rollback) {
        world.tick = message.tick - 1;

        if (message.game && message.game !== world.currentGame.id) {
          world.setGame(world.games[message.game]);
        }

        Object.keys(message.serializedEntities).forEach((entityId) => {
          if (world.entities[entityId]) {
            world.entities[entityId].deserialize(message.serializedEntities[entityId]);
          }
        });
      }

      // set actions
      Object.entries(message.actions).forEach(([entityId, actions]) => {
        world.actionBuffer.set(message.tick, entityId, actions);
      });

      // handle new chat messages
      const numChats = Object.keys(message.chats).length;
      if (numChats) {
        Object.entries(message.chats).forEach(([playerId, messages]) => {
          if (playerId === clientPlayerId) return;
          world.chatHistory.set(world.tick, playerId, messages);
        });
      }

      // if message buffer is empty, set flag to red
      if (serverMessageBuffer.length === 0) {
        world.tickFlag = "red";
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
