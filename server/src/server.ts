import { Playground } from "@piggo-legends/playground";
import { ServerWebSocket, Server } from "bun";

type TickData = {
  type: "game",
  tick: number,
  player: string,
  entities: Record<string, unknown>
}

class PiggoServer {

  bun: Server;
  playground = new Playground({});
  id = 1;

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
    const message = `hello ${JSON.stringify(ws.data)}`;
    console.log(message);
    ws.send(message);
  }

  handleMessage = (ws: ServerWebSocket<unknown>, msg: string) => {
    if (typeof msg != "string") return;
    const parsedMessage = JSON.parse(msg) as TickData;

    console.log(`received from ${ws.remoteAddress} ` + parsedMessage.tick, parsedMessage.player);
  }
}

const server = new PiggoServer();
console.log(`包 wss://localhost:${server.bun.port}`);
