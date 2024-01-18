import { TickData, localCommandBuffer } from "@piggo-legends/core";
import { Playground } from "@piggo-legends/playground";
import { ServerWebSocket, Server } from "bun";
import { ServerNetcodeSystem } from "./ServerNetcodeSystem";

class PiggoServer {

  bun: Server;
  id = 1;
  clients: Record<string, ServerWebSocket<unknown>> = {};

  playground = new Playground({ runtimeMode: "server" });

  constructor() {
    this.playground.addSystems([ServerNetcodeSystem({ game: this.playground, clients: this.clients })]);

    this.bun = Bun.serve({
      port: 3000,
      fetch: (r: Request, server: Server) => server.upgrade(r) ? new Response() : new Response("upgrade failed", { status: 500 }),
      websocket: {
        close: (_) => console.log("WebSocket closed"),
        open: this.handleOpen,
        message: this.handleMessage
      },
    });
  }

  handleOpen = (ws: ServerWebSocket<unknown>) => {
    // set data for this client
    ws.data = { id: this.id };

    // increment id
    this.id += 1;

    // add to clients
    this.clients[ws.remoteAddress] = ws;

    console.log(`player:${this.id} ${ws.remoteAddress} connected`);
  }

  handleMessage = (ws: ServerWebSocket<unknown>, msg: string) => {
    if (typeof msg != "string") return;
    const parsedMessage = JSON.parse(msg) as TickData;

    if (parsedMessage.commands.length) localCommandBuffer.push(...parsedMessage.commands);
  }
}

const server = new PiggoServer();
console.log(`包 wss://localhost:${server.bun.port}`);
