import { TickData, localCommandBuffer } from "@piggo-legends/contrib";
import { Playground } from "@piggo-legends/playground";
import { ServerWebSocket, Server } from "bun";

class PiggoServer {

  bun: Server;
  id = 1;
  clients: Record<string, ServerWebSocket<unknown>> = {};

  playground = new Playground({
    systems: [
      {
        onTick: (_) => {
          const tickData: TickData = {
            commands: [],
            player: "server",
            tick: this.playground.tick,
            type: "game"
          };
          // send tick data to all clients
          Object.values(this.clients).forEach((client) => {
            client.send(JSON.stringify(tickData));
          });
        },
        componentTypeQuery: ["none"]
      }
    ]
  });

  constructor() {
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

    // send message to client
    // const message = `hello ${JSON.stringify(ws.data)}`;

    // add to clients
    this.clients[ws.remoteAddress] = ws;

    // console.log(message);
    // ws.send(message);
  }

  handleMessage = (ws: ServerWebSocket<unknown>, msg: string) => {
    if (typeof msg != "string") return;
    const parsedMessage = JSON.parse(msg) as TickData;

    if (parsedMessage.commands.length) localCommandBuffer.push(...parsedMessage.commands);
  }
}

const server = new PiggoServer();
console.log(`包 wss://localhost:${server.bun.port}`);
