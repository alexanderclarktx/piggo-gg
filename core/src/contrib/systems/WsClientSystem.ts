import { Entity, World, SystemBuilder, Command, localCommandBuffer, SerializedEntity } from "@piggo-legends/core";

const SERVER_LOCAL = "ws://localhost:3000";
const SERVER_REMOTE = "wss://api.piggo.gg";

export type TickData = {
  type: "game"
  tick: number
  player: string
  commands: Record<number, Record<string, Command[]>>
  serializedEntities: Record<string, SerializedEntity>
}

// WssNetcodeSystem handles networked entities over WebSockets
export const WsClientSystem: SystemBuilder = ({ world, clientPlayerId }) => {
  const wsClient = new WebSocket(SERVER_LOCAL);

  setInterval(() => {
    if (lastMessageTick && ((world.tick - lastMessageTick) < 50)) {
      world.isConnected = true;
    } else {
      world.isConnected = false;
    }
  }, 1000);

  let scheduleRollback: boolean = false;
  let lastMessageTick: number = 0;
  let latestServerMessage: TickData | null = null;

  wsClient.onmessage = (event) => {
    const message = JSON.parse(event.data) as TickData;
    if (latestServerMessage && (message.tick < latestServerMessage.tick)) return;
    if (message.tick < lastMessageTick) return;
    latestServerMessage = message;
    lastMessageTick = message.tick;
  }

  const handleLatestMessage = () => {
    let message = latestServerMessage;
    if (!message) return;
    let rollback = false;

    // compare commands
    const localCommands = localCommandBuffer[message.tick];
    const messageCommands = message.commands[message.tick];
    for (const [entityId, messageCommandsForEntity] of Object.entries(messageCommands)) {
      // console.log(`rollback ${entityId} ${command.actionId} ${JSON.stringify(localCommands)}`);
      if (!localCommands) {
        console.log("WEIRD");
        rollback = true;
        break;
      } else if (!localCommands[entityId]) {
        console.log(`rollback missed command ${entityId} ${JSON.stringify(messageCommandsForEntity)} ${JSON.stringify(localCommands)}`);
        rollback = true;
        break;
      } else if (localCommands[entityId].length !== messageCommandsForEntity.length) {
        console.log(`rollback count ${entityId} ${localCommands[entityId].length} ${messageCommandsForEntity.length}`);
        rollback = true;
        break;
      } else {
        const commands = localCommands[entityId];
        if (commands) commands.forEach((command) => {
          if (!messageCommandsForEntity.includes(command)) {
            console.log(`rollback ${entityId} ${command} ${JSON.stringify(localCommands)}`);
            rollback = true;
          }
        });
      }
    }

    // compare entity counts
    if (!rollback && world.entitiesAtTick[message.tick]) {
      if (Object.keys(world.entitiesAtTick[message.tick]).length !== Object.keys(message.serializedEntities).length) {
        console.log(`rollback entity count ${Object.keys(world.entitiesAtTick[message.tick]).length} ${Object.keys(message.serializedEntities).length}`);
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
              console.log(`rollback entity state ${entityId} local:${JSON.stringify(localEntity)}\nremote:${JSON.stringify(msgEntity)}`);
              rollback = true;
              break;
            }
          } else {
            console.log("no buffered message", message.tick, world.entitiesAtTick[message.tick].serializedEntities);
            rollback = true;
            break
          }
        } else {
          console.log("no buffered tick data", message.tick, Object.keys(world.entitiesAtTick), world.entitiesAtTick[message.tick]);
          rollback = true;
          break
        }
      }
    }

    // do a rollback
    if (rollback) world.rollback(message);
  }

  const onTick = (_: Entity[]) => {
    handleLatestMessage();
    latestServerMessage = null;
    sendMessage(world);
  }

  const sendMessage = (world: World) => {
    const message: TickData = {
      type: "game",
      tick: world.tick,
      player: clientPlayerId ?? "unknown",
      commands: localCommandBuffer,
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
