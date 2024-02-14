import { TickData, localCommandBuffer, serializeEntity, SerializedEntity } from "@piggo-legends/core";
import { Game, System } from "@piggo-legends/core";
import { ServerWebSocket } from "bun";

export type ServerNetcodeSystemProps = {
  game: Game
  clients: Record<string, ServerWebSocket<unknown>>
}

export const WsServerSystem = ({ game, clients }: ServerNetcodeSystemProps): System => {

  const onTick = () => {

    const serializedEntities: Record<string, SerializedEntity> = {}
    for (const entityId in game.entities) {
      if (game.entities[entityId].components.networked) {
        serializedEntities[entityId] = serializeEntity(game.entities[entityId]);
      }
    }
    // if (game.tick % 500 === 0) console.log(serializedEntities);

    // build tick data
    const tickData: TickData = {
      commands: {[game.tick]: localCommandBuffer[game.tick]},
      player: "server",
      tick: game.tick,
      type: "game",
      serializedEntities
    };

    // send tick data to all clients
    Object.values(clients).forEach((client) => {
      client.send(JSON.stringify(tickData));
    });
  }

  return { onTick }
}
