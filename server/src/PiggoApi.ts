import { ExtractedRequestTypes, NetMessageTypes, RequestTypes, ResponseData, entries, genHash, keys, stringify } from "@piggo-gg/core"
import { WorldManager, PrismaClient } from "@piggo-gg/server"
import { Server, ServerWebSocket, env } from "bun"
import { ethers } from "ethers"
import jwt from "jsonwebtoken"

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
    [R in RequestTypes["route"]]: (_: { ws: ServerWebSocket<PerClientData>, data: ExtractedRequestTypes<R> }) =>
      Promise<ExtractedRequestTypes<R>['response']>
  }
  init: () => PiggoApi
  handleClose: (ws: ServerWebSocket<PerClientData>) => void
  handleOpen: (ws: ServerWebSocket<PerClientData>) => void
  handleMessage: (ws: ServerWebSocket<PerClientData>, data: string) => void
}

export const PiggoApi = (): PiggoApi => {

  const prisma = new PrismaClient()

  const JWT_SECRET = process.env["JWT_SECRET"] ?? "piggo"

  const piggoApi: PiggoApi = {
    bun: undefined,
    clientIncr: 1,
    clients: {},
    worlds: {
      "hub": WorldManager(),
    },
    handlers: {
      "lobby/list": async ({ data }) => {
        return { id: data.id }
      },
      "lobby/create": async ({ ws, data }) => {
        const lobbyId = genHash()

        // create world
        piggoApi.worlds[lobbyId] = WorldManager()

        // set world id for this client
        ws.data.worldId = lobbyId

        console.log(`lobby created: ${lobbyId} data ${data}`)

        return { id: data.id, lobbyId }
      },
      "lobby/join": async ({ ws, data }) => {
        if (!piggoApi.worlds[data.join]) {
          piggoApi.worlds[data.join] = WorldManager()
        }

        ws.data.worldId = data.join
        return { id: data.id }
      },
      "lobby/exit": async ({ data }) => {
        return { id: data.id }
      },
      "friends/list": async ({ data }) => {
        return { id: data.id }
      },
      "friends/add": async ({ data }) => {
        return { id: data.id }
      },
      "friends/remove": async ({ data }) => {
        return { id: data.id }
      },
      "auth/login": async ({ data }) => {
        console.log("auth/login", data)

        // 1. verify signature
        const recoveredAddress = ethers.verifyMessage(data.message, data.signature)
        const verified = recoveredAddress.toLowerCase() === data.address.toLowerCase()

        if (!verified) {
          console.log("Signature verification failed", data)
          return { id: data.id, error: "Signature verification failed" }
        }

        // 2. login or create account
        let user = undefined
        user = await prisma.users.findUnique({ where: { walletAddress: data.address } })
        if (!user) {
          user = await prisma.users.create({
            data: {
              name: data.address,
              walletAddress: data.address
            }
          })
          console.log(`User created from ${data.address}`)
        } else {
          console.log(`User found from ${data.address}`)
        }

        if (!user) return { id: data.id, error: "User not found" }

        // 3. create session token
        const token = jwt.sign({ address: user.name, name: user.name }, JWT_SECRET, { expiresIn: "8h" })

        return { id: data.id, token, name: user.name }
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
    handleMessage: (ws: ServerWebSocket<PerClientData>, data: string) => {
      if (typeof data != "string") return

      const wsData = JSON.parse(data) as NetMessageTypes
      if (!wsData.type) return

      if (wsData.type === "request") {
        const handler = piggoApi.handlers[wsData.data.route]

        if (handler) {
          // @ts-expect-error
          const result = handler({ ws, data: wsData.data }) // TODO fix type casting
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
