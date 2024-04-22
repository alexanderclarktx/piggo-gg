import { InvokedAction, Entity, SystemBuilder, RollbackTickData, World, Noob, Ball, Skelly, Zombie } from "@piggo-gg/core";

const servers = {
  dev: "ws://localhost:3000",
  staging: "wss://piggo-api-staging.up.railway.app",
  production: "wss://api.piggo.gg"
} as const;

// rollback netcode client
export const RollbackClientSystem: SystemBuilder<"RollbackClientSystem"> = ({
  id: "RollbackClientSystem",
  init: ({ world, clientPlayerId }) => {
    const wsClient = new WebSocket(servers.production);
    // const wsClient = new WebSocket(servers.staging);
    // const wsClient = new WebSocket(servers.dev);

    let ticksAhead = 0;
    let lastLatency = 0;

    setInterval(() => {
      (lastMessageTick && ((world.tick - lastMessageTick) < 500)) ? world.isConnected = true : world.isConnected = false;
    }, 200);

    let lastMessageTick: number = 0;
    let latestServerMessage: RollbackTickData | null = null;

    wsClient.onmessage = (event) => {
      const message = JSON.parse(event.data) as RollbackTickData;

      // ignore messages from the past
      if (latestServerMessage && (message.tick < latestServerMessage.tick)) return;
      if (message.tick < lastMessageTick) return;

      // handle interpolated entities
      Object.keys(message.actions).map(Number).forEach((tick) => {
        for (const [entityId, actions] of Object.entries(message.actions[tick])) {
          if (entityId.startsWith("skelly") && entityId !== `skelly-${clientPlayerId}`) {
            const actionsCopy = [...actions];

            if (!message.actions[tick + ticksAhead + 1]) {
              message.actions[tick + ticksAhead + 1] = {};
            }

            message.actions[tick + ticksAhead + 1][entityId] = actionsCopy;
            delete message.actions[tick][entityId];
          }
        }
      });

      // store latest message
      latestServerMessage = message;
      lastMessageTick = message.tick;

      // record latency
      lastLatency = Date.now() - message.timestamp;
      if (message.latency) world.ms = (lastLatency + message.latency) / 2;
    }

    const onTick = (_: Entity[]) => {
      handleLatestMessage();
      latestServerMessage = null;
      sendMessage(world);
    }

    const rollback = (world: World, td: RollbackTickData) => {
      const now = Date.now();
    
      // determine how many ticks to increment
      ticksAhead = Math.ceil((((world.ms) / world.tickrate) * 2) + 1);
      if (Math.abs(ticksAhead - (world.tick - td.tick)) <= 1) {
        ticksAhead = world.tick - td.tick;
      }
    
      console.log(`ms:${world.ms} msgFrame:${td.tick} clientFrame:${world.tick} targetFrame:${td.tick + ticksAhead}`);
    
      // set tick
      world.tick = td.tick - 1;
    
      // remove old local entities
      Object.keys(world.entities).forEach((entityId) => {
        if (world.entities[entityId].components.networked) {
    
          if (!td.serializedEntities[entityId]) {
            // delete if not present in rollback frame
            console.log("DELETE ENTITY", entityId, td.serializedEntities);
            world.removeEntity(entityId);
          }
        }
      });
    
      // add new entities if not present locally
      Object.keys(td.serializedEntities).forEach((entityId) => {
        if (!world.entities[entityId]) {
          if (entityId.startsWith("zombie")) {
            // world.addEntity(Zombie({ id: entityId }));
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
    
      // deserialize everything
      Object.keys(td.serializedEntities).forEach((entityId) => {
        if (world.entities[entityId]) {
          world.entities[entityId].deserialize(td.serializedEntities[entityId]);
        }
      });
    
      // update local action buffer
      Object.keys(td.actions).map(Number).forEach((tick) => {
        Object.keys(td.actions[tick]).forEach((entityId) => {
          // skip future actions for controlled entities
          if (tick > td.tick && world.entities[entityId]?.components.controlled?.data.entityId === world.clientPlayerId) return;
    
          world.actionBuffer.set(tick, entityId, td.actions[tick][entityId]);
        });
      });
    
      Object.values(world.systems).forEach((system) => system.onRollback ? system.onRollback() : null);
    
      // run system updates
      for (let i = 0; i < ticksAhead + 1; i++) world.onTick({ isRollback: true });
    
      console.log(`rollback took ${Date.now() - now}ms`);
    }

    const sendMessage = (world: World) => {

      // prepare actions from recent frames for the client entity
      const recentTicks = world.actionBuffer.keys().filter((tick) => tick >= (world.tick - 20));
      let actions: Record<number, Record<string, InvokedAction[]>> = {};
      let chats: Record<number, Record<string, string[]>> = {};

      recentTicks.forEach((tick) => {
        const actionsAtTick = world.actionBuffer.atTick(tick);
        if (actionsAtTick && Object.keys(actionsAtTick).length) {
          actions[tick] = actionsAtTick;
        }

        const chatsAtTick = world.chatHistory.atTick(tick);
        if (chatsAtTick && Object.keys(chatsAtTick).length) {
          chats[tick] = chatsAtTick;
        }
      });

      const message: RollbackTickData = {
        type: "game",
        tick: world.tick,
        timestamp: Date.now(),
        player: clientPlayerId ?? "unknown",
        actions,
        chats,
        serializedEntities: {}
      }

      if (wsClient.readyState === wsClient.OPEN) wsClient.send(JSON.stringify(message));
    }

    const handleLatestMessage = () => {
      if (latestServerMessage === null) return;
      let message = latestServerMessage;
      let shouldRollback = false;

      const mustRollback = (log: string) => {
        if (!shouldRollback) {
          shouldRollback = true;
          console.log(`rollback from ${message.tick}! ${log}`);
        }
      }

      if (message.tick > world.tick) mustRollback("server is ahead");

      // handle future actions
      if (!shouldRollback) {
        Object.keys(message.actions).map(Number).filter((t) => t > world.tick).forEach((futureTick) => {
          Object.keys(message.actions[futureTick]).forEach((entityId) => {
            if ((entityId === clientPlayerId) || (entityId === `skelly-${clientPlayerId}`)) return;
            world.actionBuffer.set(futureTick, entityId, message.actions[futureTick][entityId]);
          });
        });
      }

      // compare action buffers
      if (!shouldRollback) Object.keys(message.actions).map(Number).forEach((tick) => {

        if (tick < message.tick) return;

        const messageActions = message.actions[tick] ?? {};
        const localActions = world.actionBuffer.atTick(tick);

        for (const [entityId, messageActionsForEntity] of Object.entries(messageActions)) {
          if (!localActions) {
            console.warn("missing client actions for tick");
            return;
          } else if (!localActions[entityId]) {
            mustRollback(`missed e:${entityId} server:${JSON.stringify(messageActionsForEntity)} local:${JSON.stringify(localActions)}`);
          } else if (localActions[entityId].length !== messageActionsForEntity.length) {
            mustRollback(`action count ${entityId} ${localActions[entityId].length} ${messageActionsForEntity.length}`);
          } else {
            const actions = localActions[entityId];
            if (actions) actions.forEach((localC) => {
              if (!messageActionsForEntity.includes(localC)) {
                mustRollback(`CLIENT ACTION ${entityId}:${localC} not in ${JSON.stringify(messageActionsForEntity)}`);
              }
            });

            messageActionsForEntity.forEach((serverC) => {
              if (!actions.includes(serverC)) {
                mustRollback(`SERVER ACTION ${entityId}:${serverC} not in ${JSON.stringify(actions)}`);
              }
            });
          }
        }
      });

      // compare entity counts
      if (!shouldRollback && world.entitiesAtTick[message.tick]) {
        if (Object.keys(world.entitiesAtTick[message.tick]).length !== Object.keys(message.serializedEntities).length) {
          mustRollback(`entity count local:${Object.keys(message.serializedEntities).length} remote:${Object.keys(world.entitiesAtTick[message.tick]).length}`);
        }
      }

      // compare entity states
      if (!shouldRollback) {
        Object.entries(message.serializedEntities).forEach(([entityId, msgEntity]) => {
          const entitiesAtTick = world.entitiesAtTick[message.tick];
          if (entitiesAtTick) {
            const localEntity = entitiesAtTick[entityId];
            if (localEntity) {
              if (entityId.startsWith("skelly") && entityId !== `skelly-${clientPlayerId}`) return;
              if (JSON.stringify(localEntity) !== JSON.stringify(msgEntity)) {
                mustRollback(`entity state ${entityId} local:${JSON.stringify(localEntity)}\nremote:${JSON.stringify(msgEntity)}`);
              }
            } else {
              mustRollback(`no buffered message ${world.entitiesAtTick[message.tick].serializedEntities}`);
            }
          } else {
            mustRollback(`no buffered tick data ${Object.keys(world.entitiesAtTick)} ${world.entitiesAtTick[message.tick]}`);
          }
        });
      }

      // handle new chat messages
      const numChats = Object.keys(message.chats).length;
      if (numChats) {
        Object.keys(message.chats).map(Number).forEach((tick) => {
          Object.keys(message.chats[tick]).forEach((entityId) => {
            world.chatHistory.set(tick, entityId, message.chats[tick][entityId]);
          });
        });
      }

      if (shouldRollback) rollback(world, message);
    }

    return {
      id: "RollbackClientSystem",
      query: ["networked"],
      onTick,
      skipOnRollback: true
    }
  }
});
