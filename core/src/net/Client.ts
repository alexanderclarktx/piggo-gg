import {
  Character, LobbyCreate, LobbyJoin, NetMessageTypes, Player, RequestData, RequestTypes,
  World, randomPlayerId, SoundManager, randomHash, AuthLogin, FriendsList, Pls,
  NetClientReadSystem, NetClientWriteSystem, ProfileGet, ProfileCreate, MetaPlayers,
  FriendsAdd, KeyBuffer, isMobile, LobbyList, BadResponse, LobbyExit
} from "@piggo-gg/core"
import { decode, encode } from "@msgpack/msgpack"
import toast from "react-hot-toast"

const servers = {
  dev: "ws://localhost:3000",
  // dev: "wss://piggo-api-staging.up.railway.app",
  production: "wss://api.piggo.gg"
} as const

export const hosts = {
  dev: "http://localhost:8000",
  production: "https://piggo.gg"
}

type APICallback<R extends RequestTypes = RequestTypes> = (response: R["response"] | BadResponse) => void
type Callback<R extends RequestTypes = RequestTypes> = (response: R["response"]) => void

export type Client = {
  analog: {
    left: { angle: number, power: number, active: boolean }
    right: { angle: number, power: number, active: boolean }
  }
  bufferDown: KeyBuffer
  bufferUp: KeyBuffer
  connected: boolean
  clickThisFrame: {
    value: number
    set: (value: number) => void
    reset: () => void
  }
  env: "dev" | "production"
  lastMessageTick: number
  lobbyId: string | undefined
  ms: number
  mobile: boolean
  player: Player
  soundManager: SoundManager
  token: string | undefined
  ws: WebSocket
  playerId: () => string
  playerName: () => string
  playerCharacter: () => Character | undefined
  copyInviteLink: () => void
  lobbyCreate: (callback: Callback<LobbyCreate>) => void
  lobbyJoin: (lobbyId: string, callback: Callback<LobbyJoin>) => void
  lobbyLeave: () => void
  lobbyList: (callback: Callback<LobbyList>) => void
  metaPlayers: (callback: Callback<MetaPlayers>) => void
  authLogin: (jwt: string, callback?: Callback<AuthLogin>) => void
  aiPls: (prompt: string, callback: Callback<Pls>) => void
  profileCreate: (name: string, callback: Callback) => void
  profileGet: (callback?: Callback) => void
  friendsAdd: (name: string, callback: Callback) => void
  friendsList: (callback: Callback<FriendsList>) => void
}

export type ClientProps = {
  world: World
}

export const Client = ({ world }: ClientProps): Client => {

  let requestBuffer: Record<string, APICallback> = {}

  const player = Player({ id: randomPlayerId() })
  world.addEntity(player)

  const request = <R extends RequestTypes>(data: Omit<R, "response">, callback: APICallback<R>) => {
    if (client.ws.readyState !== WebSocket.OPEN) return

    const requestData: RequestData = { type: "request", data }
    client.ws.send(encode(requestData))
    requestBuffer[requestData.data.id] = callback

    // TODO handle timeout
  }

  const env = location ? (location.hostname === "localhost" ? "dev" : "production") : "dev"

  const client: Client = {
    analog: {
      left: { angle: 0, power: 0, active: false },
      right: { angle: 0, power: 0, active: false }
    },
    bufferDown: KeyBuffer(),
    bufferUp: KeyBuffer(),
    connected: false,
    clickThisFrame: {
      value: 0,
      set: (value: number) => client.clickThisFrame.value = value,
      reset: () => client.clickThisFrame.value = 0
    },
    env,
    lastMessageTick: 0,
    lobbyId: undefined,
    ms: 0,
    mobile: isMobile(),
    player,
    soundManager: SoundManager(world),
    token: undefined,
    ws: new WebSocket(servers[env]),
    playerId: () => {
      return client.player.id
    },
    playerName: () => {
      return client.player.components.pc.data.name
    },
    playerCharacter: () => {
      return client.player.components.controlling.getCharacter(world)
    },
    copyInviteLink: () => {
      let url = ""
      if (client.lobbyId) {
        url = `${hosts[env]}/?join=${client.lobbyId}`
        navigator.clipboard.writeText(url)
        toast.success(`Copied Invite Link`)
      } else {
        client.lobbyCreate((response) => {
          if ("error" in response) return

          url = `${hosts[env]}/?join=${response.lobbyId}`
          navigator.clipboard.writeText(url)
          toast.success(`Copied Invite Link`)
        })
      }
    },
    lobbyCreate: (callback) => {
      request<LobbyCreate>({ route: "lobby/create", type: "request", id: randomHash() }, (response) => {
        if ("error" in response) {
          console.error("failed to create lobby", response.error)
        } else {
          client.lobbyId = response.lobbyId
          world.addSystemBuilders([NetClientReadSystem, NetClientWriteSystem])
          world.tick = -100
          callback(response)
        }
      })
    },
    lobbyJoin: (lobbyId, callback) => {
      request<LobbyJoin>({ route: "lobby/join", type: "request", id: randomHash(), join: lobbyId }, (response) => {
        if ("error" in response) {
          console.error("failed to join lobby", response.error)
        } else {
          client.lobbyId = lobbyId
          callback(response)
          world.addSystemBuilders([NetClientReadSystem, NetClientWriteSystem])
        }
      })
    },
    lobbyLeave: () => {
      request<LobbyExit>({ route: "lobby/exit", type: "request", id: randomHash() }, (response) => {
        if ("error" in response) {
          console.error("failed to leave lobby", response.error)
        } else {
          client.lobbyId = undefined

          world.removeSystem(NetClientReadSystem.id)
          world.removeSystem(NetClientWriteSystem.id)

          const players = world.players()
          for (const player of players) {
            if (player.id === client.player.id) continue

            world.removeEntity(player.id)
          }
        }
      })
    },
    lobbyList: (callback) => {
      request<LobbyList>({ route: "lobby/list", type: "request", id: randomHash() }, (response) => {
        if ("error" in response) {
          console.error("failed to get lobby list", response.error)
        } else {
          callback(response)
        }
      })
    },
    metaPlayers: (callback) => {
      request<MetaPlayers>({ route: "meta/players", type: "request", id: randomHash() }, (response) => {
        if ("error" in response) {
          console.error("failed to get meta players", response.error)
        } else {
          callback(response)
        }
      })
    },
    authLogin: async (jwt, callback) => {
      request<AuthLogin>({ route: "auth/login", type: "request", id: randomHash(), jwt }, (response) => {
        if ("error" in response) {
          console.error("failed to login", response.error)
        } else {
          client.token = response.token

          if (localStorage) localStorage.setItem("token", response.token)
          if (!response.newUser) client.profileGet()
          if (callback) callback(response)
        }
      })
    },
    aiPls: (prompt, callback) => {
      request<Pls>({ route: "ai/pls", type: "request", id: randomHash(), prompt }, (response) => {
        if ("error" in response) {
          console.error("failed to get AI response", response.error)
        } else {
          callback(response)
        }
      })
    },
    profileCreate: (name, callback) => {
      if (!client.token) return
      request<ProfileCreate>({ route: "profile/create", type: "request", id: randomHash(), token: client.token, name }, (response) => {
        if ("error" in response) {
          console.error("failed to create profile", response.error)
        } else {
          client.profileGet()
          callback(response)
        }
      })
    },
    profileGet: (callback) => {
      if (!client.token) return
      request<ProfileGet>({ route: "profile/get", type: "request", id: randomHash(), token: client.token }, (response) => {
        if ("error" in response) {
          console.error("failed to get profile", response.error)
          client.token = undefined
          if (localStorage) localStorage.removeItem("token")
        } else {
          client.player.components.pc.data.name = response.name

          const character = client.player.components.controlling.getCharacter(world)
          if (character) {
            world.actions.push(world.tick + 2, character.id, { actionId: "changeSkin", params: { skin: "ghost" } })
          }

          if (callback) callback(response)
        }
      })
    },
    friendsAdd: (name, callback) => {
      if (!client.token) return
      request<FriendsAdd>({ route: "friends/add", type: "request", id: randomHash(), token: client.token, name }, (response) => {
        if ("error" in response) {
          console.error("failed to add friend", response.error)
        } else {
          callback(response)
        }
      })
    },
    friendsList: (callback) => {
      if (!client.token) return
      request<FriendsList>({ route: "friends/list", type: "request", id: randomHash(), token: client.token }, (response) => {
        if ("error" in response) {
          console.error("failed to get friends list", response.error)
        } else {
          callback(response)
        }
      })
    }
  }

  setInterval(() => {
    client.connected = Boolean(client.lastMessageTick && ((world.tick - client.lastMessageTick) < 60))
  }, 200)

  const setupWs = () => {
    client.ws.binaryType = "arraybuffer"

    client.ws.addEventListener("close", () => {
      console.error("websocket closed")
      world.removeSystem(NetClientReadSystem.id)
      world.removeSystem(NetClientWriteSystem.id)
    })

    client.ws.addEventListener("message", (event) => {
      try {
        const message = decode(new Uint8Array(event.data)) as NetMessageTypes

        if (message.type !== "response") return

        if (message.data.id in requestBuffer) {
          const callback = requestBuffer[message.data.id]

          callback(message.data)
          delete requestBuffer[message.data.id]
        }
      } catch (error) {
        console.error("failed to parse message", error)
      }
    })

    client.ws.onopen = () => {
      console.log("connected to server")

      const joinString: string | null = new URLSearchParams(window.location.search).get("join")
      if (joinString) {
        client.lobbyJoin(joinString, () => { })
        return
      }

      const gameString: string | null = new URLSearchParams(window.location.search).get("game")
      if (gameString && world.games[gameString]) {
        world.setGame(gameString)
      }

      if (localStorage) {
        const token = localStorage.getItem("token")
        if (token) {
          client.token = token
          client.profileGet()
        }
      }
    }

    client.ws.onclose = () => {
      console.error("disconnected from server")

      setTimeout(() => {
        console.log("reconnecting to server")
        client.ws = new WebSocket(servers[env])
        setupWs()
      }, 2000)
    }
  }

  setupWs()

  return client
}
