// import { Entity, Game, RtcPeer, SystemBuilder, Player } from "@piggo-legends/core";

// type TickData = {
//   type: "game",
//   tick: number,
//   player: string,
//   entities: Record<string, SerializedEntity>
// }

// type PeerState = {
//   connected: boolean
//   connection: RtcPeer
//   buffer: TickData | null
// }

// // NetcodeSystem handles networked entities
// export const RtcNetcodeSystem: SystemBuilder = ({ game, net, clientPlayerId }) => {
//   let peers: Record<string, PeerState> = {};

//   const onTick = (entities: Entity[]) => {

//     if (net) {
//       // handle new peers
//       for (const name in net.connections) {
//         if (!peers[name]) {
//           // add peer to peerStates
//           peers[name] = { connected: false, connection: net.connections[name], buffer: null };

//           // handle incoming messages from the peer
//           peers[name].connection.events.addEventListener("message", (event: CustomEvent<any>) => {
//             if (event.detail.type === "game") {
//               peers[name].buffer = event.detail as TickData;
//             } else if (event.detail.type === "init") {
//               handleInitialConnection(event.detail as TickData, game);
//             }
//           });
//         }
//       }
//     }

//     // handle incoming tick data
//     for (const peer of Object.values(peers)) {
//       handleMessage(peer, game);
//     }

//     // send tick data
//     sendMessage(entities, game);
//   }

//   const handleMessage = (peer: PeerState, game: Game) => {
//     if (peer.buffer) {
//       // handle initial connection if peer is new
//       if (!peer.connected) {
//         handleInitialConnection(peer.buffer, game);
//         peer.connected = true;
//       }

//       // debug log
//       // if (peer.buffer.tick % 1000 === 0) console.log("received", peer.buffer);

//       // update each entity
//       Object.entries(peer.buffer.entities).forEach(([id, entity]) => {
//         if (game.entities[id]) {
//           // entity should deserialize


//           // TODO not generic enough
//           const controlled = game.entities[id].components.controlled;
//           if (controlled && controlled.entityId === clientPlayerId) return;

//           // TODO not generic enough
//           const position = game.entities[id].components.position;
//           if (position && entity.position) {
//             position.deserialize(entity.position)
//           }
//         }
//       });
//     }

//     // clear peer's buffer
//     peer.buffer = null;
//   }

//   const handleInitialConnection = (td: TickData, game: Game) => {
//     console.log("adding entity");
//     game.addEntity({
//       id: td.player,
//       components: {
//         player: new Player({ name: td.player }),
//       },
//     });
//   }

//   const sendMessage = (entities: Entity[], game: Game) => {
//     const serializedEntitites: Record<string, SerializedEntity> = {};

//     // serialize each entity
//     entities.forEach((entity) => {
//       let serialized: SerializedEntity = {};

//       const position = entity.components.position;
//       if (position) serialized.position = position.serialize();

//       serializedEntitites[entity.id] = serialized;
//     });

//     // construct tick message
//     const message: TickData = {
//       type: "game",
//       tick: game.tick,
//       player: clientPlayerId,
//       entities: serializedEntitites
//     }

//     // send message to each connected peer
//     for (const peer of Object.values(peers)) {
//       if (peer.connection.pc.connectionState === "connected") {
//         peer.connection.sendMessage(message);
//         // if (game.tick % 1000 === 0) console.log("sent", message);
//       }
//     }
//   }

//   return {
//     query: ["networked"],
//     onTick
//   }
// }
