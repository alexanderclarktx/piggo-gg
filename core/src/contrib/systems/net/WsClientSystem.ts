import { Entity, SystemBuilder, TickData, World } from "@piggo-gg/core";

const servers = {
  dev: "ws://localhost:3000",
  staging: "wss://piggo-api-staging.up.railway.app",
  production: "wss://api.piggo.gg"
} as const;

// WssNetcodeSystem handles networked entities over WebSockets
export const WsClientSystem: SystemBuilder<"WsClientSystem"> = ({
  id: "WsClientSystem",
  init: ({ world, clientPlayerId }) => {
    // const wsClient = new WebSocket(servers.production);
    // const wsClient = new WebSocket(servers.staging);
    const wsClient = new WebSocket(servers.dev);

    let lastLatency = 0;

    setInterval(() => {
      (lastMessageTick && ((world.tick - lastMessageTick) < 500)) ? world.isConnected = true : world.isConnected = false;
    }, 200);

    let lastMessageTick: number = 0;
    let latestServerMessage: TickData | null = null;

    wsClient.onmessage = (event) => {
      const message = JSON.parse(event.data) as TickData;

      // ignore messages from the past
      if (latestServerMessage && (message.tick < latestServerMessage.tick)) return;
      if (message.tick < lastMessageTick) return;

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

    const sendMessage = (world: World) => {

      // prepare actions from recent frames for the client entity
      const recentTicks = world.actionBuffer.keys().filter((tick) => tick >= (world.tick - 20));
      let actions: Record<number, Record<string, string[]>> = {};
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

      const message: TickData = {
        type: "game",
        tick: world.tick,
        timestamp: Date.now(),
        player: clientPlayerId ?? "unknown",
        actions,
        chats,
        serializedEntities: {}
      }

      const numChats = Object.keys(chats).length;
      // numChats ? console.log(JSON.stringify(chats)) : null;

      if (wsClient.readyState === wsClient.OPEN) wsClient.send(JSON.stringify(message));
    }

    const handleLatestMessage = () => {
      if (latestServerMessage === null) return;
      let message = latestServerMessage;
      let rollback = false;

      const mustRollback = (log: string) => {
        if (!rollback) {
          rollback = true;
          console.log(`rollback from ${message.tick}! ${log}`);
        }
      }

      if (message.tick > world.tick) mustRollback("server is ahead");

      // compare action buffers
      if (!rollback) Object.keys(message.actions).forEach((tickString) => {
        const tick = Number(tickString);

        if (tick < message.tick) return;

        const messageActions = message.actions[tick] ?? {};
        const localActions = world.actionBuffer.atTick(tick);

        for (const [entityId, messageActionsForEntity] of Object.entries(messageActions)) {
          if (!localActions) {
            mustRollback("missing client actions for tick");
          } else if (!localActions[entityId]) {
            mustRollback(`missed e:${entityId} tick:${message.tick} ${JSON.stringify(messageActionsForEntity)} ${JSON.stringify(localActions)}`);
          } else if (localActions[entityId].length !== messageActionsForEntity.length) {
            mustRollback(`count ${entityId} ${localActions[entityId].length} ${messageActionsForEntity.length}`);
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
      if (!rollback && world.entitiesAtTick[message.tick]) {
        if (Object.keys(world.entitiesAtTick[message.tick]).length !== Object.keys(message.serializedEntities).length) {
          mustRollback(`entity count local:${Object.keys(message.serializedEntities).length} remote:${Object.keys(world.entitiesAtTick[message.tick]).length}`);
        }
      }

      // compare entity states
      if (!rollback) {
        for (const [entityId, msgEntity] of Object.entries(message.serializedEntities)) {
          const entitiesAtTick = world.entitiesAtTick[message.tick];
          if (entitiesAtTick) {
            const localEntity = entitiesAtTick[entityId];
            if (localEntity) {
              if (JSON.stringify(localEntity) !== JSON.stringify(msgEntity)) {
                mustRollback(`entity state ${entityId} local:${JSON.stringify(localEntity)}\nremote:${JSON.stringify(msgEntity)}`);
              }
            } else {
              mustRollback(`no buffered message ${world.entitiesAtTick[message.tick].serializedEntities}`);
            }
          } else {
            mustRollback(`no buffered tick data ${Object.keys(world.entitiesAtTick)} ${world.entitiesAtTick[message.tick]}`);
          }
        }
      }
      const numChats = Object.keys(message.chats).length;
      numChats ? console.log(JSON.stringify(message.chats)) : null;
      if (numChats) {
        Object.keys(message.chats).forEach((frameString) => {
          const frame = Number(frameString);
          // if (frame < world.tick) return;
          Object.keys(message.chats[frame]).forEach((entityId) => {
            world.chatHistory.set(frame, entityId, message.chats[frame][entityId]);
          });
        });
      }

      if (rollback) world.rollback(message);
    }

    return {
      id: "WsClientSystem",
      query: ["networked"],
      onTick,
      skipOnRollback: true
    }
  }
});
