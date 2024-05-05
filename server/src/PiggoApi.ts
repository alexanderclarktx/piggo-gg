import { ExtractedRequestTypes, NetMessageTypes, RequestTypes, ResponseData, genHash } from "@piggo-gg/core";
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
  worlds: Record<string, WorldManager> = {};

  handlers: { [R in RequestTypes["route"]]: (ws: ServerWebSocket<PerClientData>, msg: ExtractedRequestTypes<R>) => Promise<ExtractedRequestTypes<R>['response']> } = {
    "lobby/list": async (ws, msg) => {
      return { id: msg.id }
    },
    "lobby/create": async (ws, msg) => {
      const lobbyId = genHash();

      // create world
      this.worlds[lobbyId] = WorldManager();

      // set world id for this client
      ws.data.worldId = lobbyId;

      return { id: msg.id, lobbyId };
    },
    "lobby/join": async (ws, msg) => {
      if (!this.worlds[msg.join]) return { id: msg.id, error: "world does not exist" };
      ws.data.worldId = msg.join;
      return { id: msg.id }
    },
    "lobby/exit": async (ws, msg) => {
      return { id: msg.id }
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

    setInterval(() => {
      Object.entries(this.worlds).forEach(([id, world]) => {
        if (Object.keys(world.clients).length === 0) delete this.worlds[id];
      });
    }, 10000);
  }

  handleClose = (ws: ServerWebSocket<PerClientData>) => {
    const world = this.worlds[ws.data.worldId];
    world.handleClose(ws);

    delete this.clients[ws.data.id];
  }

  handleOpen = (ws: ServerWebSocket<PerClientData>) => {
    // set data for this client
    ws.data = { id: this.clientIncr, worldId: "", playerName: "UNKNOWN" };

    // increment id
    this.clientIncr += 1;
  }

  handleMessage = (ws: ServerWebSocket<PerClientData>, msg: string) => {
    if (typeof msg != "string") return;

    const wsData = JSON.parse(msg) as NetMessageTypes;
    if (!wsData.type) return;

    if (wsData.type === "request") {
      const handler = this.handlers[wsData.request.route];

      if (handler) {
        // @ts-expect-error
        const result = handler(ws, wsData.request);
        result.then((data) => {
          const responseData: ResponseData = { type: "response", response: data }
          ws.send(JSON.stringify(responseData));
        });
      }
      return;
    }

    const world = this.worlds[ws.data.worldId];
    world.handleMessage(ws, wsData);
  }
}

const server = new PiggoApi();
console.log(`包 ${server.bun.url}`);
