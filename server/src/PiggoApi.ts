import { ClientRequest, DelayTickData } from "@piggo-gg/core";
import { WorldManager } from "@piggo-gg/server";
import { Server, ServerWebSocket, env } from "bun";

export type PerClientData = {
  id: number
  playerName?: string
  worldId: string
}

export class PiggoApi {

  bun: Server;
  clientIncr = 1;
  clients: Record<string, ServerWebSocket<PerClientData>> = {};

  worlds: Record<string, WorldManager> = {
    "A": WorldManager(),
    "B": WorldManager()
  }

  handlers: Record<ClientRequest["route"], (ws: ServerWebSocket<PerClientData>, msg: ClientRequest) => void> = {
    "lobby/list": (ws, msg) => {
      console.log("lobby/list", msg);
    },
    "lobby/create": (ws, msg) => {
      console.log("lobby/create", msg);
    },
    "lobby/join": (ws, msg) => {
      console.log("lobby/join", msg);
    },
    "lobby/exit": (ws, msg) => {
      console.log("lobby/exit", msg);
    },
  }

  constructor() {
    this.bun = Bun.serve({
      hostname: "0.0.0.0",
      port: env.PORT ?? 3000,
      fetch: (r: Request, server: Server) => server.upgrade(r) ? new Response() : new Response("upgrade failed", { status: 500 }),
      websocket: {
        perMessageDeflate: true,
        close: this.handleClose,
        open: this.handleOpen,
        message: this.handleMessage,
      },
    });
  }

  handleClose = (ws: ServerWebSocket<PerClientData>) => {
    const world = this.worlds[ws.data.worldId];
    world.handleClose(ws);

    delete this.clients[ws.data.id];
  }

  handleOpen = (ws: ServerWebSocket<PerClientData>) => {
    // set data for this client
    ws.data = { id: this.clientIncr, worldId: "A", playerName: "UNKNOWN" };

    // increment id
    this.clientIncr += 1;
  }

  handleMessage = (ws: ServerWebSocket<PerClientData>, msg: string) => {
    if (typeof msg != "string") return;

    const wsData = JSON.parse(msg) as ClientRequest | DelayTickData;
    if (!wsData.type) return;

    if (wsData.type === "request") {
      const handler = this.handlers[wsData.route];
      if (handler) handler(ws, wsData);
      return;
    }

    const world = this.worlds[ws.data.worldId];
    world.handleMessage(ws, wsData);
  }
}

const server = new PiggoApi();
console.log(`包 ${server.bun.url}`);
