import {
  Character, DelaySyncer, LobbyCreate, LobbyJoin, NetClientSystem,
  NetMessageTypes, Noob, stringify, RequestData, RequestTypes,
  Syncer, World, genPlayerId, SoundManager, genHash
} from "@piggo-gg/core"

const servers = {
  dev: "ws://localhost:3000",
  // dev: "wss://piggo-api-staging.up.railway.app",
  production: "wss://api.piggo.gg"
} as const
const env = location.hostname === "localhost" ? "dev" : "production"

type Callback<R extends RequestTypes = RequestTypes> = (response: R["response"]) => void

export type Client = {
  playerEntity: Noob
  ms: number
  ws: WebSocket
  connected: boolean
  lobbyId: string | undefined
  lastLatency: number
  lastMessageTick: number
  soundManager: SoundManager
  playerId: () => string
  playerCharacter: () => Character | undefined
  createLobby: (callback: Callback<LobbyCreate>) => void
  joinLobby: (lobbyId: string, callback: Callback<LobbyJoin>) => void
}

export type ClientProps = {
  world: World
}

export const Client = ({ world }: ClientProps): Client => {

  let syncer: Syncer = DelaySyncer
  let requestBuffer: Record<string, Callback> = {}

  const noob = Noob({ id: genPlayerId() })
  world.addEntity(noob)

  const request = <R extends RequestTypes>(data: Omit<R, "response">, callback: Callback<R>) => {
    const requestData: RequestData = { type: "request", data }
    client.ws.send(stringify(requestData))
    requestBuffer[requestData.data.id] = callback
    // TODO handle timeout
  }

  const client: Client = {
    ws: new WebSocket(servers[env]),
    connected: false,
    playerEntity: noob,
    ms: 0,
    lastLatency: 0,
    lastMessageTick: 0,
    lobbyId: undefined,
    soundManager: SoundManager(world),
    playerId: () => {
      return client.playerEntity.id
    },
    playerCharacter: () => {
      return client.playerEntity.components.controlling.getControlledEntity(world)
    },
    createLobby: (callback) => {
      request<LobbyCreate>({ route: "lobby/create", type: "request", id: genHash() }, (response) => {
        client.lobbyId = response.lobbyId
        callback(response)
        world.addSystemBuilders([NetClientSystem(syncer)])
      })
    },
    joinLobby: (lobbyId, callback) => {
      request<LobbyJoin>({ route: "lobby/join", type: "request", id: genHash(), join: lobbyId }, (response) => {
        if (response.error) {
          console.error("Client: failed to join lobby", response.error)
        } else {
          client.lobbyId = lobbyId
          callback(response)
          world.addSystemBuilders([NetClientSystem(syncer)])
        }
      })
    }
  }

  setInterval(() => {
    client.connected = Boolean(client.lastMessageTick && ((world.tick - client.lastMessageTick) < 60))
  }, 200)

  client.ws.addEventListener("close", () => {
    console.error("websocket closed")
    world.removeSystem(NetClientSystem(syncer).id)
  })

  client.ws.addEventListener("message", (event) => {
    try {
      const message = JSON.parse(event.data) as NetMessageTypes
      if (message.type !== "response") return

      if (message.data.id in requestBuffer) {
        const callback = requestBuffer[message.data.id]

        callback(message.data)
        delete requestBuffer[message.data.id]
      }
    } catch (error) {
      console.error("Client: failed to parse message", error)
    }
  })

  client.ws.onopen = () => {
    // client.connected = true
    console.log("Client: connected to server")

    // const joinString: string = new URLSearchParams(window.location.search).get("join") ?? "hub"
    const joinString: string | null = new URLSearchParams(window.location.search).get("join")
    if (joinString) client.joinLobby(joinString, () => { })
  }

  client.ws.onclose = () => {
    // client.connected = false
    console.error("Client: disconnected from server")
  }

  return client
}
