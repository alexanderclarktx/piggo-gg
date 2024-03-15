import { WorldManager } from "@piggo-gg/server";
import { Server, ServerWebSocket, env } from "bun";

export type PerClientData = {
  id: number
  playerName?: string
  worldId: string
}

export class PiggoApi {

  bun: Server;
  clientCount = 1;
  clients: Record<string, ServerWebSocket<PerClientData>> = {};

  worlds: Record<string, WorldManager> = {
    "A": WorldManager(),
    "B": WorldManager()
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

    setInterval(() => {
      Object.values(this.clients).forEach((client) => {
        const { playerName, worldId } = client.data;
        if (playerName) {
          if (!this.worlds[worldId].clients[playerName]) {
            this.worlds[worldId].clients[playerName] = client
          }
        }
      });
    }, 10)
  }

  handleClose = (ws: ServerWebSocket<PerClientData>) => {
    const world = this.worlds[ws.data.worldId];
    world.handleClose(ws);
    delete this.clients[ws.data.id];
  }

  handleOpen = (ws: ServerWebSocket<PerClientData>) => {
    // set data for this client
    ws.data = { id: this.clientCount, worldId: "A", playerName: "UNKNOWN" };

    // increment id
    this.clientCount += 1;
  }

  handleMessage = (ws: ServerWebSocket<PerClientData>, msg: string) => {
    if (typeof msg != "string") return;

    const world = this.worlds[ws.data.worldId];
    world.handleMessage(ws, msg);
  }
}

const server = new PiggoApi();
console.log(`包 ${server.bun.url}`);
