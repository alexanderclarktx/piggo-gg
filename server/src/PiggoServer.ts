import { Networked, Player, TickData, localCommandBuffer } from "@piggo-legends/core";
import { Playground } from "@piggo-legends/playground";
import { ServerWebSocket, Server, env } from "bun";
import { ServerNetcodeSystem } from "./ServerNetcodeSystem";

class PiggoServer {

  bun: Server;
  id = 1;
  clients: Record<string, ServerWebSocket<unknown>> = {};

  playground = new Playground({ runtimeMode: "server" });

  constructor() {
    this.playground.addSystems([ServerNetcodeSystem({ game: this.playground, clients: this.clients })]);

    this.bun = Bun.serve({
      hostname: "0.0.0.0",
      port: env.PORT ?? 3000,
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

    // add player entity if it doesn't exist
    if (!this.playground.entities[parsedMessage.player]) {
      this.playground.addEntity({
        id: parsedMessage.player,
        components: {
          networked: new Networked({ isNetworked: true }),
          player: new Player({ name: parsedMessage.player }),
        }
      });
    }

    if (parsedMessage.commands) {
      Object.keys(parsedMessage.commands).forEach((frameNumber) => {
        const frame = Number(frameNumber);

        if (!localCommandBuffer[frame]) localCommandBuffer[frame] = {};

        Object.keys(parsedMessage.commands[frame]).forEach((entityId) => {
          const command = parsedMessage.commands[frame][entityId];
          localCommandBuffer[frame][entityId] = command;
          // console.log(`pushed ${JSON.stringify(command.actionId)} to ${frame}`);
        });
        // console.log(localCommandBuffer[frame].size);
      });

      // localCommandBuffer.push(...parsedMessage.commands);
      // console.log(`pushed ${JSON.stringify(parsedMessage.commands.map((c) => c.actionId))}`);
    }
  }
}

const server = new PiggoServer();
console.log(`包 ${server.bun.url}`);
