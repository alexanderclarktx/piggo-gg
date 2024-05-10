import {
  DelaySyncer, LobbyCreate, LobbyCreateRequest, LobbyJoin,
  LobbyJoinRequest, NetClientSystem, NetMessageTypes,
  RequestData, RequestTypes, Syncer, World, genPlayerId
} from "@piggo-gg/core";

const servers = {
  dev: "ws://localhost:3000",
  staging: "wss://piggo-api-staging.up.railway.app",
  production: "wss://api.piggo.gg"
} as const;

type Callback<R extends RequestTypes = RequestTypes> = (response: R["response"]) => void;

export type Client = {
  playerId: string
  ms: number
  ws: WebSocket
  lobbyId: string | undefined
  lastLatency: number
  lastMessageTick: number
  createLobby: (callback: Callback<LobbyCreate>) => void
  joinLobby: (lobbyId: string, callback: Callback<LobbyJoin>) => void
}

export type ClientProps = {
  world: World
}

export const Client = ({ world }: ClientProps): Client => {

  let syncer: Syncer = DelaySyncer;
  let requestBuffer: Record<string, Callback> = {};

  const client: Client = {
    // ws: new WebSocket(servers.production),
    // ws: new WebSocket(servers.staging),
    ws: new WebSocket(servers.dev),
    playerId: genPlayerId(),
    ms: 0,
    lastLatency: 0,
    lastMessageTick: 0,
    lobbyId: undefined,
    createLobby: (callback) => {
      // send create lobby request
      const requestData: RequestData = { type: "request", request: LobbyCreateRequest() };
      client.ws.send(JSON.stringify(requestData));

      // store callback
      requestBuffer[requestData.request.id] = (response: LobbyCreate["response"]) => {
        client.lobbyId = response.lobbyId;
        callback(response);
        world.addSystemBuilders([NetClientSystem(syncer)]);
      };
    },
    joinLobby: (lobbyId, callback) => {
      // send join lobby request
      const requestData: RequestData = { type: "request", request: LobbyJoinRequest(lobbyId) };
      client.ws.send(JSON.stringify(requestData));

      // store callback
      requestBuffer[requestData.request.id] = (response: LobbyJoin["response"]) => {
        console.log(response);
        if (response.error) {
          console.error("Client: failed to join lobby", response.error)
        } else {
          client.lobbyId = lobbyId;
          callback(response);
          world.addSystemBuilders([NetClientSystem(syncer)]);
        }
      };
    }
  }

  setInterval(() => {
    world.isConnected = Boolean(client.lastMessageTick && ((world.tick - client.lastMessageTick) < 60));
  }, 200);

  client.ws.addEventListener("close", () => {
    console.log("CLOSED");
    world.removeSystem(NetClientSystem(syncer).id);
  });

  client.ws.addEventListener("message", (event) => {
    try {
      const message = JSON.parse(event.data) as NetMessageTypes;
      if (message.type !== "response") return;

      if (message.response.id in requestBuffer) {
        const callback = requestBuffer[message.response.id];

        callback(message.response);
        delete requestBuffer[message.response.id];
      }
    } catch (error) {
      console.error("Client: failed to parse message", error);
    }
  });

  client.ws.onopen = () => {
    const join = new URLSearchParams(window.location.search).get("join");
    if (join) client.joinLobby(join, () => {});
  }

  return client;
}
