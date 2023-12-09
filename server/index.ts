
let id = 0;

Bun.serve({
  port: 3000,
  fetch(req, server) {
    if (server.upgrade(req)) return;
    return new Response("Upgrade failed :(", { status: 500 });
  },
  websocket: {
    open: (ws) => {
      console.log("WebSocket opened");
      ws.send("Hello from the server!");

      ws.data = id;
      id += 1;
    },
    close: (ws) => {
      console.log("WebSocket closed");
    },
    message: (ws, msg) => {
      if (typeof msg != "string") return;

      console.log(`received from ${ws.remoteAddress} ${ws.data}: ` + msg);
      ws.send("Echo: " + msg);
    }
  },
});
console.log("websocket server running on port 3000");
