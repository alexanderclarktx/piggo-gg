import { Entity, SystemBuilder, TickData, World } from "@piggo-legends/core";

const servers = {
  dev: "ws://localhost:3000",
  staging: "wss://piggo-legends-staging.up.railway.app",
  production: "wss://api.piggo.gg"
} as const;

// WssNetcodeSystem handles networked entities over WebSockets
export const WsClientSystem: SystemBuilder = ({ world, clientPlayerId }) => {
  // const wsClient = new WebSocket(servers.production);
  // const wsClient = new WebSocket(servers.staging);
  const wsClient = new WebSocket(servers.dev);

  let lastLatency = 0;

  setInterval(() => {
    if (lastMessageTick && ((world.tick - lastMessageTick) < 500)) {
      world.isConnected = true;
    } else {
      world.isConnected = false;
    }
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

  const handleLatestMessage = () => {
    if (latestServerMessage === null) return;
    let message = latestServerMessage;
    let rollback = false;

    const messageActions = message.actions[message.tick];

    // TODO consolidate with other block
    // compare actions
    for (const [entityId, messageActionsForEntity] of Object.entries(messageActions)) {
      const localActions = world.localActionBuffer[message.tick];
      if (!localActions) {
        console.log("rollback! client is behind");
        rollback = true;
        break;
      } else if (!localActions[entityId]) {
        console.log(`rollback! missed action ${entityId} ${JSON.stringify(messageActionsForEntity)} ${JSON.stringify(localActions)}`);
        rollback = true;
        break;
      } else if (localActions[entityId].length !== messageActionsForEntity.length) {
        console.log(`rollback! count ${entityId} ${localActions[entityId].length} ${messageActionsForEntity.length}`);
        rollback = true;
        break;
      } else {
        const actions = localActions[entityId];
        if (actions) actions.forEach((action) => {
          if (!messageActionsForEntity.includes(action)) {
            console.log(`rollback! ${entityId} ${action} ${JSON.stringify(messageActionsForEntity)}`);
            rollback = true;
          }
        });
      }
    }

    // check future actions
    if (!rollback) Object.keys(message.actions).forEach((tickString) => {
      const tick = Number(tickString);

      // ignore messages from the past
      if (tick <= message.tick) return;

      const messageActions = message.actions[tick];
      const localActions = world.localActionBuffer[tick];

      for (const [entityId, messageActionsForEntity] of Object.entries(messageActions)) {
        if (!localActions) {
          console.log("都 rollback! client is behind");
          rollback = true;
          break;
        } else if (!localActions[entityId]) {
          console.log(`都 rollback! missed e:${entityId} tick:${message.tick} ${JSON.stringify(messageActionsForEntity)} ${JSON.stringify(localActions)}`);
          rollback = true;
          break;
        } else if (localActions[entityId].length !== messageActionsForEntity.length) {
          console.log(`都 rollback count ${entityId} ${localActions[entityId].length} ${messageActionsForEntity.length}`);
          rollback = true;
          break;
        } else {
          const actions = localActions[entityId];
          if (actions) actions.forEach((localC) => {
            if (!messageActionsForEntity.includes(localC)) {
              console.log(`都 rollback! CLIENT ACTION ${entityId}:${localC} not in ${JSON.stringify(messageActionsForEntity)}`);
              rollback = true;
            }
          });

          messageActionsForEntity.forEach((serverC) => {
            if (!actions.includes(serverC)) {
              console.log(`都 rollback! SERVER ACTION ${entityId}:${serverC} not in ${JSON.stringify(actions)}`);
              rollback = true;
            }
          });
        }
      }
    });

    // compare entity counts
    if (!rollback && world.entitiesAtTick[message.tick]) {
      if (Object.keys(world.entitiesAtTick[message.tick]).length !== Object.keys(message.serializedEntities).length) {
        console.log(`rollback! entity count ${Object.keys(world.entitiesAtTick[message.tick]).length} ${Object.keys(message.serializedEntities).length}`);
        rollback = true;
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
              console.log(`rollback! entity state ${entityId} local:${JSON.stringify(localEntity)}\nremote:${JSON.stringify(msgEntity)}`);
              rollback = true;
              break;
            }
          } else {
            console.log("rollback! no buffered message", message.tick, world.entitiesAtTick[message.tick].serializedEntities);
            rollback = true;
            break
          }
        } else {
          console.log("rollback! no buffered tick data", message.tick, Object.keys(world.entitiesAtTick), world.entitiesAtTick[message.tick]);
          rollback = true;
          break
        }
      }
    }

    if (rollback) world.rollback(message);
  }

  const onTick = (_: Entity[]) => {
    handleLatestMessage();
    latestServerMessage = null;
    sendMessage(world);
  }

  const sendMessage = (world: World) => {

    const frames = Object.keys(world.localActionBuffer).map(Number).filter((tick) => tick >= world.tick);
    let actions: Record<number, Record<string, string[]>> = {};
    frames.forEach((tick) => {
      if (Object.keys(world.localActionBuffer[tick]).length) {
        actions[tick] = world.localActionBuffer[tick];
      }
    });

    const message: TickData = {
      type: "game",
      tick: world.tick,
      timestamp: Date.now(),
      player: clientPlayerId ?? "unknown",
      actions,
      serializedEntities: {}
    }

    if (wsClient.readyState === wsClient.OPEN) wsClient.send(JSON.stringify(message));
  }

  return {
    id: "WsClientSystem",
    query: ["networked"],
    onTick,
    skipOnRollback: true
  }
}
