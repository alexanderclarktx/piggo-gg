import { DelayClientSystem, LobbyJoinRequest, World, genHash, genPlayerId } from "@piggo-gg/core";

const servers = {
  dev: "ws://localhost:3000",
  staging: "wss://piggo-api-staging.up.railway.app",
  production: "wss://api.piggo.gg"
} as const;

export type Client = {
  ws: WebSocket
  playerId: string
  ms: number
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
    ms: 0
  }

  const join = new URLSearchParams(window.location.search).get("join");
  if (join) {
    client.ws.onopen = () => {
      const request: LobbyJoinRequest = {
        id: genHash(), type: "request", route: "lobby/join", code: join
      };

      client.ws.send(JSON.stringify(request));
      world.addSystemBuilders([DelayClientSystem]);
    }
  }

  return client;
}
