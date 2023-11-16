import { Entity, Game, GameProps, Renderer, RtcPeer, RtcPool, System } from "@piggo-legends/core";
import { Controlled, Player, Position, SerializedPosition } from "@piggo-legends/contrib";

export type TickData = {
  type: "game",
  tick: number,
  player: string,
  entities: Record<string, SerializedEntity>
}

export type SerializedEntity = {
  position?: SerializedPosition
}

type PeerState = { connected: boolean, connection: RtcPeer, buffer: TickData | null }

// NetcodeSystem handles networked entities
export const NetcodeSystem = (renderer: Renderer, net: RtcPool, thisPlayerId: string): System =>{
  let peers: Record<string, PeerState> = {};

  const onTick = (entities: Entity[], game: Game<GameProps>) => {
    // handle new peers
    for (const name in net.connections) {
      if (!peers[name]) {
        // add peer to peerStates
        peers[name] = { connected: false, connection: net.connections[name], buffer: null };

        // handle incoming messages from the peer
        peers[name].connection.events.addEventListener("message", (event: CustomEvent<any>) => {
          if (event.detail.type === "game") {
            peers[name].buffer = event.detail as TickData;
          } else if (event.detail.type === "init") {
            handleInitialConnection(event.detail as TickData, game);
          }
        });
      }
    }

    // handle incoming tick data
    for (const peer of Object.values(peers)) {
      handleMessage(peer, game);
    }

    // send tick data
    sendMessage(entities, game);
  }

  const handleMessage = (peer: PeerState, game: Game<GameProps>) => {
    if (peer.buffer) {
      // handle initial connection if peer is new
      if (!peer.connected) {
        handleInitialConnection(peer.buffer, game);
        peer.connected = true;
      }
      
      // debug log
      // if (peer.buffer.tick % 1000 === 0) console.log("received", peer.buffer);

      // update each entity
      Object.entries(peer.buffer.entities).forEach(([id, entity]) => {
        if (game.props.entities[id]) {
          // entity should deserialize


          // TODO not generic enough
          const controlled = game.props.entities[id].components.controlled as Controlled;
          if (controlled && controlled.entityId === thisPlayerId) return;
  
          // TODO not generic enough
          const position = game.props.entities[id].components.position as Position;
          if (position && entity.position) {
            position.deserialize(entity.position)
          }
        }
      });
    }

    // clear peer's buffer
    peer.buffer = null;
  }

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
    for (const entity of Object.values(entities)) {
      let serialized: SerializedEntity = {};

      const position = entity.components.position as Position;
      if (position) {
        serialized.position = position.serialize();
      }

      serializedEntitites[entity.id] = serialized;
    }

    // construct tick message
    const message: TickData = {
      type: "game",
      tick: game.tick,
      player: thisPlayerId,
      entities: serializedEntitites
    }

    // send message to each connected peer
    for (const peer of Object.values(peers)) {
      if (peer.connection.pc.connectionState === "connected") {
        peer.connection.sendMessage(message);
        // if (game.tick % 1000 === 0) console.log("sent", message);
      }
    }
  }

  return {
    renderer,
    componentTypeQuery: ["networked"],
    onTick
  }
}
