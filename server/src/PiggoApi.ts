import { ExtractedRequestTypes, NetMessageTypes, RequestTypes, ResponseData, entries, genHash, keys, stringify } from "@piggo-gg/core"
import { WorldManager } from "@piggo-gg/server"
import { Server, ServerWebSocket, env } from "bun"

export type PerClientData = {
  id: number
  playerName?: string
  worldId: string
}

export type PiggoApi = {
  bun: Server | undefined
  clientIncr: number
  clients: Record<string, ServerWebSocket<PerClientData>>
  worlds: Record<string, WorldManager>
  handlers: {
    [R in RequestTypes["route"]]: (ws: ServerWebSocket<PerClientData>, msg: ExtractedRequestTypes<R>) => Promise<ExtractedRequestTypes<R>['response']>
  }
  init: () => PiggoApi
  handleClose: (ws: ServerWebSocket<PerClientData>) => void
  handleOpen: (ws: ServerWebSocket<PerClientData>) => void
  handleMessage: (ws: ServerWebSocket<PerClientData>, msg: string) => void
}

export const PiggoApi = (): PiggoApi => {
  const piggoApi: PiggoApi = {
    bun: undefined,
    clientIncr: 1,
    clients: {},
    worlds: {
      "hub": WorldManager(),
    },
    handlers: {
      "lobby/list": async (ws, msg) => {
        return { id: msg.id }
      },
      "lobby/create": async (ws, msg) => {
        const lobbyId = genHash()

        // create world
        piggoApi.worlds[lobbyId] = WorldManager()

        // set world id for this client
        ws.data.worldId = lobbyId

        console.log(`lobby created: ${lobbyId} msg ${msg}`)

        return { id: msg.id, lobbyId }
      },
      "lobby/join": async (ws, msg) => {
        if (!piggoApi.worlds[msg.join]) {
          piggoApi.worlds[msg.join] = WorldManager()
        }

        ws.data.worldId = msg.join
        return { id: msg.id }
      },
      "lobby/exit": async (ws, msg) => {
        return { id: msg.id }
      },
      "friends/list": async (ws, msg) => {
        return { id: msg.id }
      },
      "friends/add": async (ws, msg) => {
        return { id: msg.id }
      },
      "friends/remove": async (ws, msg) => {
        return { id: msg.id }
      },
      "auth/login": async (ws, msg) => {
        console.log("auth/login", msg)
        return { id: msg.id }
      }
    },
    init: () => {
      piggoApi.bun = Bun.serve({
        hostname: "0.0.0.0",
        port: env.PORT ?? 3000,
        fetch: (r: Request, server: Server) => server.upgrade(r) ? new Response() : new Response("upgrade failed", { status: 500 }),
        websocket: {
          perMessageDeflate: true,
          close: piggoApi.handleClose,
          open: piggoApi.handleOpen,
          message: piggoApi.handleMessage,
        },
      })

      return piggoApi
    },
    handleClose: (ws: ServerWebSocket<PerClientData>) => {
      const world = piggoApi.worlds[ws.data.worldId]
      if (world) world.handleClose(ws)

      delete piggoApi.clients[ws.data.id]
    },
    handleOpen: (ws: ServerWebSocket<PerClientData>) => {
      // set data for this client
      ws.data = { id: piggoApi.clientIncr, worldId: "", playerName: "UNKNOWN" }

      // increment id
      piggoApi.clientIncr += 1
    },
    handleMessage: (ws: ServerWebSocket<PerClientData>, msg: string) => {
      if (typeof msg != "string") return

      const wsData = JSON.parse(msg) as NetMessageTypes
      if (!wsData.type) return

      if (wsData.type === "request") {
        const handler = piggoApi.handlers[wsData.data.route]

        if (handler) {
          // @ts-expect-error
          const result = handler(ws, wsData.data) // TODO fix type casting
          result.then((data) => {
            const responseData: ResponseData = { type: "response", data }
            ws.send(stringify(responseData))
          })
        }
        return
      }

      const world = piggoApi.worlds[ws.data.worldId] ?? piggoApi.worlds["hub"]
      if (world) world.handleMessage(ws, wsData)
    }
  }

  setInterval(() => {
    entries(piggoApi.worlds).forEach(([id, world]) => {
      if (keys(world.clients).length === 0) delete piggoApi.worlds[id]
    })
  }, 10000)

  return piggoApi
}

const server = PiggoApi().init()
console.log(`包 ${server.bun?.url}`)
