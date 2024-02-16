import { TickData, localCommandBuffer, serializeEntity, SerializedEntity, System, World  } from "@piggo-legends/core";
import { ServerWebSocket } from "bun";

export type ServerNetcodeSystemProps = {
  world: World
  clients: Record<string, ServerWebSocket<unknown>>
}

export const WsServerSystem = ({ world, clients }: ServerNetcodeSystemProps): System => {

  const onTick = () => {

    const serializedEntities: Record<string, SerializedEntity> = {}
    for (const entityId in world.entities) {
      if (world.entities[entityId].components.networked) {
        serializedEntities[entityId] = serializeEntity(world.entities[entityId]);
      }
    }
    // if (world.tick % 500 === 0) console.log(serializedEntities);

    // build tick data
    const tickData: TickData = {
      commands: {[world.tick]: localCommandBuffer[world.tick]},
      player: "server",
      tick: world.tick,
      type: "game",
      serializedEntities,
    };

    // send tick data to all clients
    Object.values(clients).forEach((client) => {
      client.send(JSON.stringify(tickData));
    });
  }

  return { onTick }
}
