import { Playground } from "@piggo-legends/playground";

const playground = new Playground({});

let id = 1;

const server = Bun.serve({
  port: 3000,
  fetch(req, server) {
    if (server.upgrade(req)) return;
    return new Response("Upgrade failed :(", { status: 500 });
  },
  websocket: {
    open: (ws) => {
      // set data for this client
      ws.data = {
        id: id
      }

      // increment id
      id += 1;

      // send message to client
      const message = `hello ${JSON.stringify(ws.data)}`;
      console.log(message);
      ws.send(message);
    },
    close: (_) => {
      console.log("WebSocket closed");
    },
    message: (ws, msg) => {
      if (typeof msg != "string") return;

      console.log(`received from ${ws.remoteAddress} ${ws.data}: ` + msg);
      ws.send("Echo: " + msg);
    }
  },
});

console.log(`包 wss://localhost:${server.port}`);
