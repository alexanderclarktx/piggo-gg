import { IsometricWorld, Noob, DelayTickData, World, DelayServerSystem } from "@piggo-gg/core";
import { ARAM, Legends, Soccer, Strike } from "@piggo-gg/games";
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

  const world = IsometricWorld({ runtimeMode: "server", games: [Strike, ARAM, Soccer, Legends] });
  const latestClientMessages: Record<string, { td: DelayTickData, latency: number }[]> = {};

  const handleClose = (ws: WS) => {
    world.removeEntity(ws.data.playerName!);

    delete clients[ws.remoteAddress];
    delete latestClientMessages[ws.data.playerName!];

    console.log(`${ws.data.playerName} disconnected`);
  }

  const handleMessage = (ws: WS, msg: string) => {
    const parsedMessage = JSON.parse(msg) as DelayTickData;

    // add player entity if it doesn't exist
    if (!world.entities[parsedMessage.player]) {
      ws.data.playerName = parsedMessage.player;

      world.addEntity(Noob({ id: parsedMessage.player }));

      clients[parsedMessage.player] = ws;
      latestClientMessages[parsedMessage.player] = [];

      console.log(`${ws.data.playerName} connected ${ws.remoteAddress}`);
    }

    // store last message for client
    latestClientMessages[parsedMessage.player].push({
      td: parsedMessage,
      latency: Date.now() - parsedMessage.timestamp
    });

    if (world.tick % 100 === 0) console.log(`world:${world.tick} msg:${parsedMessage.tick} diff:${world.tick - parsedMessage.tick}`);
  }

  world.systems = {
    ...{ "DelayServerSystem": DelayServerSystem({ world, clients, latestClientMessages })},
    ...world.systems
  }

  return {
    world,
    clients,
    handleMessage,
    handleClose
  }
}
