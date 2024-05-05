import { LobbyCreateRequest, LobbyJoinRequest, NetClientSystem, World, genPlayerId } from "@piggo-gg/core";

const servers = {
  dev: "ws://localhost:3000",
  staging: "wss://piggo-api-staging.up.railway.app",
  production: "wss://api.piggo.gg"
} as const;

export type Client = {
  playerId: string
  ms: number
  ws: WebSocket
  createLobby: () => void
}

export type ClientProps = {
  world: World
}

export const Client = ({ world }: ClientProps): Client => {
  const client = {
    ws: new WebSocket(servers.production),
    // ws: new WebSocket(servers.staging),
    // ws: new WebSocket(servers.dev),
    playerId: genPlayerId(),
    ms: 0,
    createLobby: () => {
      const request = LobbyCreateRequest();
      client.ws.send(JSON.stringify(request));
      world.addSystemBuilders([NetClientSystem]);
    }
  }

  // client.ws.addEventListener("message", () => {
    // const data = JSON.parse(event.data);
    // console.log("onmessage");
  // });

  const join = new URLSearchParams(window.location.search).get("join");
  if (join) {
    client.ws.onopen = () => {
      const request = LobbyJoinRequest(join);
      client.ws.send(JSON.stringify(request));
      world.addSystemBuilders([NetClientSystem]);
    }
  }

  return client;
}
