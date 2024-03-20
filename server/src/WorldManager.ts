import { IsometricWorld, Noob, DelayTickData, World, DelayServerSystem } from "@piggo-gg/core";
import { Legends, Soccer, Strike } from "@piggo-gg/games";
import { PerClientData } from "@piggo-gg/server";
import { ServerWebSocket } from "bun";

export type WS = ServerWebSocket<PerClientData>

export type WorldManager = {
  world: World
  clients: Record<string, WS>
  handleMessage: (ws: WS, msg: string) => void
  handleClose: (ws: WS) => void
}

export type WorldManagerProps = {
  clients?: Record<string, WS>
}

export const WorldManager = ({ clients = {} }: WorldManagerProps = {}): WorldManager => {

  const world = IsometricWorld({ runtimeMode: "server", games: [Soccer, Legends, Strike] });

  const latestClientMessages: Record<string, { td: DelayTickData, latency: number }[]> = {};

  const handleClose = (ws: WS) => {

    // remove player entity
    world.removeEntity(ws.data.playerName!);

    // remove from clients
    delete clients[ws.remoteAddress];

    delete latestClientMessages[ws.data.playerName!];

    console.log(`${ws.data.playerName} disconnected`);
  }

  const handleMessage = (ws: WS, msg: string) => {
    const parsedMessage = JSON.parse(msg) as DelayTickData;

    // add player entity if it doesn't exist
    if (!world.entities[parsedMessage.player]) {
      ws.data.playerName = parsedMessage.player;

      clients[parsedMessage.player] = ws;

      console.log(`${ws.data.playerName} connected ${ws.remoteAddress}`);

      world.addEntity(Noob({ id: parsedMessage.player }));

      latestClientMessages[parsedMessage.player] = [];
    }

    // store last message for client
    latestClientMessages[parsedMessage.player].push({
      td: parsedMessage,
      latency: Date.now() - parsedMessage.timestamp
    });

    if (world.tick % 100 === 0) console.log(`world:${world.tick} msg:${parsedMessage.tick} diff:${world.tick - parsedMessage.tick}`);
  }

  world.addSystems([DelayServerSystem({ world, clients, latestClientMessages })]);

  return {
    world,
    clients,
    handleMessage,
    handleClose
  }
}
