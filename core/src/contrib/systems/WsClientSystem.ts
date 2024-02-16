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

  let latestServerMessage: TickData | null = null;

  wsClient.onmessage = (event) => {
    const message = JSON.parse(event.data) as TickData;
    latestServerMessage = message;
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
        console.log(`rollback entity count ${Object.keys(world.entities).length} ${Object.keys(message.serializedEntities).length}`);
        rollback = true;
      }
    }

    // compare entity states
    if (!rollback) {
      for (const [entityId, serializedEntities] of Object.entries(message.serializedEntities)) {
        const localEntity = world.entities[entityId];
        if (localEntity) {
          const entitiesAtTick = world.entitiesAtTick[message.tick];
          if (entitiesAtTick) {
            const localSerializedEntity = entitiesAtTick[entityId];
            if (localSerializedEntity) {
              if (JSON.stringify(localSerializedEntity) !== JSON.stringify(serializedEntities)) {
                console.log(`rollback entity state ${entityId} ${JSON.stringify(localSerializedEntity)} ${JSON.stringify(serializedEntities)}`);
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
    }

    // rewind to message tick and then fast-forward
    if (rollback) {
      localCommandBuffer[message.tick] = message.commands[message.tick];
      world.rollback(message);
    }
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
    query: ["networked"],
    onTick,
    skipOnRollback: true
  }
}
