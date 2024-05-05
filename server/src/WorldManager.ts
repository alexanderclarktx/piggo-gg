import { NetServerSystem, NetMessageTypes, IsometricWorld, Noob, World } from "@piggo-gg/core";
import { ARAM, Hubworld, Legends, Soccer, Strike } from "@piggo-gg/games";
import { PerClientData } from "@piggo-gg/server";
import { ServerWebSocket } from "bun";

export type WS = ServerWebSocket<PerClientData>

export type WorldManager = {
  world: World
  clients: Record<string, WS>
  getNumClients: () => number
  handleMessage: (ws: WS, msg: NetMessageTypes) => void
  handleClose: (ws: WS) => void
}

export type WorldManagerProps = {
  clients?: Record<string, WS>
}

export const WorldManager = ({ clients = {} }: WorldManagerProps = {}): WorldManager => {

  const world = IsometricWorld({ runtimeMode: "server", games: [Hubworld, Strike, ARAM, Soccer, Legends] });
  const latestClientMessages: Record<string, { td: NetMessageTypes, latency: number }[]> = {};

  world.systems = {
    ...{ "DelayServerSystem": NetServerSystem({ world, clients, latestClientMessages }) },
    ...world.systems
  }

  return {
    world,
    clients,
    getNumClients: () => Object.keys(clients).length,
    handleClose: (ws: WS) => {
      world.removeEntity(ws.data.playerName!);

      delete clients[ws.remoteAddress];
      delete latestClientMessages[ws.data.playerName!];

      console.log(`${ws.data.playerName} disconnected`);
    },
    handleMessage: (ws: WS, msg: NetMessageTypes) => {
      if (msg.type !== "game") return;

      // add player entity if it doesn't exist
      if (!world.entities[msg.player]) {
        ws.data.playerName = msg.player;

        world.addEntity(Noob({ id: msg.player }));

        clients[msg.player] = ws;
        latestClientMessages[msg.player] = [];

        console.log(`${ws.data.playerName} connected ${ws.remoteAddress}`);
      }

      // store last message for client
      latestClientMessages[msg.player].push({
        td: msg,
        latency: Date.now() - msg.timestamp
      });

      if (world.tick % 100 === 0) console.log(`world:${world.tick} msg:${msg.tick} diff:${world.tick - msg.tick}`);
    }
  }
}
