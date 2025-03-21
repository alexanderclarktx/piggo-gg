import { ExtractedRequestTypes, Friend, NetMessageTypes, RequestTypes, ResponseData, entries, genHash, keys, stringify } from "@piggo-gg/core"
import { ServerWorld, PrismaClient, gptPrompt } from "@piggo-gg/server"
import { Server, ServerWebSocket, env } from "bun"
import { ethers } from "ethers"
import jwt from "jsonwebtoken"
import { encode } from "@msgpack/msgpack"

export type PerClientData = {
  id: number
  playerId: string
  playerName?: string
  worldId: string
}

type SessionToken = { address: string, name: string }

export type Api = {
  bun: Server | undefined
  clientIncr: number
  clients: Record<string, ServerWebSocket<PerClientData>>
  worlds: Record<string, ServerWorld>
  handlers: {
    [R in RequestTypes["route"]]: (_: { ws: ServerWebSocket<PerClientData>, data: ExtractedRequestTypes<R> }) =>
      Promise<ExtractedRequestTypes<R>['response']>
  }
  init: () => Api
  handleClose: (ws: ServerWebSocket<PerClientData>) => void
  handleOpen: (ws: ServerWebSocket<PerClientData>) => void
  handleMessage: (ws: ServerWebSocket<PerClientData>, data: string) => void
}

export const Api = (): Api => {

  const prisma = new PrismaClient()

  const JWT_SECRET = process.env["JWT_SECRET"] ?? "piggo"

  const api: Api = {
    bun: undefined,
    clientIncr: 1,
    clients: {},
    worlds: {},
    handlers: {
      "lobby/list": async ({ data }) => {
        return { id: data.id }
      },
      "lobby/create": async ({ ws, data }) => {
        const lobbyId = genHash()

        // create world
        api.worlds[lobbyId] = ServerWorld()

        // set world id for this client
        ws.data.worldId = lobbyId

        console.log(`lobby created: ${lobbyId}`)

        return { id: data.id, lobbyId }
      },
      "lobby/join": async ({ ws, data }) => {
        if (!api.worlds[data.join]) {
          api.worlds[data.join] = ServerWorld()
        }

        ws.data.worldId = data.join
        return { id: data.id }
      },
      "lobby/exit": async ({ data }) => {
        return { id: data.id }
      },
      "friends/list": async ({ data }) => {
        let result: { id: string, friends: Friend[] } = { friends: [], id: data.id }

        let token: SessionToken | undefined = undefined

        try {
          token = jwt.verify(data.token, JWT_SECRET) as SessionToken
        } catch (e) {
          return { id: data.id, error: "JWT verification failed" }
        }

        const user = await prisma.users.findUnique({ where: { name: token.name } })
        if (!user) return { id: data.id, error: "User not found" }

        const friends = await prisma.friends.findMany({
          where: { user1: user, status: "ACCEPTED" },
          include: { user2: true }
        })

        result.friends = friends.map(({ user2 }) => {
          return { address: user2.walletAddress, name: user2.name, online: false }
        })

        return result
      },
      "friends/add": async ({ data }) => {
        return { id: data.id }
      },
      "friends/remove": async ({ data }) => {
        return { id: data.id }
      },
      "profile/get": async ({ ws, data }) => {
        let token: SessionToken | undefined = undefined

        // 1. verify jwt
        try {
          token = jwt.verify(data.token, JWT_SECRET) as SessionToken
        } catch (e) {
          return { id: data.id, error: "JWT verification failed" }
        }

        // 2. find user
        const user = await prisma.users.findUnique({ where: { name: token.name } })
        if (!user) return { id: data.id, error: "User not found" }

        // 3. update websocket playerName
        ws.data.playerName = user.name

        // 4. update player entity name
        const pc = api.worlds[ws.data.worldId]?.world.entity(ws.data.playerId)?.components.pc
        if (pc) pc.data.name = user.name

        return { id: data.id, name: user.name }
      },
      "auth/login": async ({ ws, data }) => {

        // 1. verify signature
        const recoveredAddress = ethers.verifyMessage(data.message, data.signature)
        const verified = recoveredAddress.toLowerCase() === data.address.toLowerCase()

        if (!verified) {
          return { id: data.id, error: "Signature verification failed" }
        }

        // 2. login or create account
        let user = await prisma.users.findUnique({ where: { walletAddress: data.address } })
        if (!user) {
          user = await prisma.users.create({
            data: {
              name: data.address,
              walletAddress: data.address
            }
          })
          console.log(`User Created: ${data.address}`)
        } else {
          console.log(`User Found: ${data.address}`)
        }

        if (!user) return { id: data.id, error: "User not found" }

        // 3. create session token
        const token = jwt.sign({ address: user.name, name: user.name }, JWT_SECRET, { expiresIn: "8h" })

        // 4. update websocket playerName
        ws.data.playerName = user.name

        // 5. update player entity name
        const pc = api.worlds[ws.data.worldId]?.world.entity(ws.data.playerId)?.components.pc
        if (pc) pc.data.name = user.name

        return { id: data.id, token, name: user.name }
      },
      "ai/pls": async ({ data }) => {
        const response = await gptPrompt(data.prompt)
        return { id: data.id, response }
      }
    },
    init: () => {
      api.bun = Bun.serve({
        hostname: "0.0.0.0",
        port: env.PORT ?? 3000,
        fetch: (r: Request, server: Server) => {
          const origin = r.headers.get("origin")
          if (!origin || !["https://piggo.gg", "http://localhost:8000"].includes(origin)) {
            return new Response("invalid origin", { status: 403 })
          }
          return server.upgrade(r) ? new Response() : new Response("upgrade failed", { status: 500 })
        },
        websocket: {
          perMessageDeflate: false,
          close: api.handleClose,
          open: api.handleOpen,
          message: api.handleMessage,
        },
      })

      return api
    },
    handleClose: (ws: ServerWebSocket<PerClientData>) => {
      const world = api.worlds[ws.data.worldId]
      if (world) world.handleClose(ws)

      delete api.clients[ws.data.id]
    },
    handleOpen: (ws: ServerWebSocket<PerClientData>) => {
      // set data for this client
      ws.data = { id: api.clientIncr, worldId: "", playerName: "noob", playerId: "" }

      // increment id
      api.clientIncr += 1
    },
    handleMessage: (ws: ServerWebSocket<PerClientData>, data: string) => {
      if (typeof data != "string") return

      const wsData = JSON.parse(data) as NetMessageTypes
      if (!wsData.type) return

      if (wsData.type === "request") {
        const handler = api.handlers[wsData.data.route]

        if (handler) {
          console.log("request", stringify(wsData.data))

          // @ts-expect-error
          const result = handler({ ws, data: wsData.data }) // TODO fix type casting
          result.then((data) => {
            console.log("response", stringify(data))
            const responseData: ResponseData = { type: "response", data }
            ws.send(encode(responseData))
          })
        }
        return
      }

      const world = api.worlds[ws.data.worldId]
      if (world) world.handleMessage(ws, wsData)
    }
  }

  setInterval(() => {
    // cleanup empty worlds
    entries(api.worlds).forEach(([id, world]) => {
      if (keys(world.clients).length === 0) {
        delete api.worlds[id]
        console.log(`world deleted: ${id}`)
      }
    })
  }, 10000)

  return api
}

const server = Api().init()
console.log(`包 ${server.bun?.url}`)
