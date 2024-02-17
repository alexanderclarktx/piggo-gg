import { EnemySpawnSystem, Networked, Player, PlayerSpawnSystem, TickData, localCommandBuffer } from "@piggo-legends/core";
import { Playground } from "@piggo-legends/games";
import { ServerWebSocket, Server, env } from "bun";
import { WsServerSystem } from "./WsServerSystem";

type PerClientData = {
  id: number
  playerName: string
}

class PiggoServer {

  bun: Server;
  clientCount = 1;
  clients: Record<string, ServerWebSocket<unknown>> = {};

  playground = Playground({ runtimeMode: "server" });

  constructor() {
    this.playground.addSystems([
      // EnemySpawnSystem(this.playground),
      // PlayerSpawnSystem(this.playground),
      WsServerSystem({ world: this.playground, clients: this.clients })
    ]);

    this.bun = Bun.serve({
      hostname: "0.0.0.0",
      port: env.PORT ?? 3000,
      fetch: (r: Request, server: Server) => server.upgrade(r) ? new Response() : new Response("upgrade failed", { status: 500 }),
      websocket: {
        close: this.handleClose,
        open: this.handleOpen,
        message: this.handleMessage,
      },
    });
  }

  handleClose = (ws: ServerWebSocket<PerClientData>) => {

    // remove player entity
    this.playground.removeEntity(ws.data.playerName);

    // remove from clients
    delete this.clients[ws.remoteAddress];

    console.log(`${ws.data.playerName} disconnected`);
  }

  handleOpen = (ws: ServerWebSocket<PerClientData>) => {
    // set data for this client
    ws.data = { id: this.clientCount, playerName: "UNKNOWN" };

    // increment id
    this.clientCount += 1;

    // add to clients
    this.clients[ws.remoteAddress + ws.data.id] = ws;
  }

  handleMessage = (ws: ServerWebSocket<PerClientData>, msg: string) => {
    if (typeof msg != "string") return;
    const parsedMessage = JSON.parse(msg) as TickData;

    // add player entity if it doesn't exist
    if (!this.playground.entities[parsedMessage.player]) {
      ws.data.playerName = parsedMessage.player;

      console.log(`${ws.data.playerName} connected ${ws.remoteAddress}`);

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
