import { Entity, Game, GameProps, System } from "@piggo-legends/core";
import { Player, Position, SerializedPosition } from "@piggo-legends/contrib";

type TickData = {
  type: "game",
  tick: number,
  player: string,
  entities: Record<string, SerializedEntity>
}

type SerializedEntity = {
  position?: SerializedPosition
}

export type WssNetcodeSystemProps = {
  thisPlayerId: string
}

// WssNetcodeSystem handles networked entities over WebSockets
export const WssNetcodeSystem = ({ thisPlayerId }: WssNetcodeSystemProps): System =>{
  const wsClient = new WebSocket("ws://localhost:3000");

  const onTick = (entities: Entity[], game: Game<GameProps>) => {
    // send tick data
    sendMessage(entities, game);
  }

  // const handleMessage = (game: Game<GameProps>) => {
  //   if (peer.buffer) {
  //     // handle initial connection if peer is new
  //     if (!peer.connected) {
  //       handleInitialConnection(peer.buffer, game);
  //       peer.connected = true;
  //     }
      
  //     // debug log
  //     // if (peer.buffer.tick % 1000 === 0) console.log("received", peer.buffer);

  //     // update each entity
  //     Object.entries(peer.buffer.entities).forEach(([id, entity]) => {
  //       if (game.entities[id]) {
  //         // entity should deserialize


  //         // TODO not generic enough
  //         const controlled = game.entities[id].components.controlled as Controlled;
  //         if (controlled && controlled.entityId === thisPlayerId) return;
  
  //         // TODO not generic enough
  //         const position = game.entities[id].components.position as Position;
  //         if (position && entity.position) {
  //           position.deserialize(entity.position)
  //         }
  //       }
  //     });
  //   }

  //   // clear peer's buffer
  //   peer.buffer = null;
  // }

  const handleInitialConnection = (td: TickData, game: Game<GameProps>) => {
    console.log("adding entity");
    game.addEntity({
      id: td.player,
      components: {
        player: new Player({ name: td.player }),
      },
    });
  }

  const sendMessage = (entities: Entity[], game: Game<GameProps>) => {
    const serializedEntitites: Record<string, SerializedEntity> = {};

    // serialize each entity
    entities.forEach((entity) => {
      let serialized: SerializedEntity = {};

      const position = entity.components.position as Position;
      if (position) {
        serialized.position = position.serialize();
      }

      serializedEntitites[entity.id] = serialized;
    });

    // construct tick message
    const message: TickData = {
      type: "game",
      tick: game.tick,
      player: thisPlayerId,
      entities: serializedEntitites
    }

    if (wsClient.readyState === wsClient.OPEN) wsClient.send(JSON.stringify(message));
  }

  return {
    componentTypeQuery: ["networked"],
    onTick
  }
}
