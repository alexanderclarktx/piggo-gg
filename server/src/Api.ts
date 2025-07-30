import {
  ExtractedRequestTypes, Friend, NetMessageTypes, RequestTypes,
  ResponseData, entries, randomHash, keys, round, stringify, values
} from "@piggo-gg/core"
import { ServerWorld, PrismaClient } from "@piggo-gg/server"
import { Server, ServerWebSocket, env } from "bun"
import jwt from "jsonwebtoken"
import { decode, encode } from "@msgpack/msgpack"
import { OAuth2Client } from "google-auth-library"

export type PerClientData = {
  id: number
  ip: string | null
  playerId: string
  playerName?: string
  worldId: string
}

type SessionToken = { googleId: string }

type Handler<R extends RequestTypes["route"]> = (_: { ws: ServerWebSocket<PerClientData>, data: ExtractedRequestTypes<R> }) =>
  Promise<ExtractedRequestTypes<R>['response']>

export type Api = {
  bun: Server | undefined
  clientIncr: number
  clients: Record<string, ServerWebSocket<PerClientData>>
  worlds: Record<string, ServerWorld>
  handlers: { [R in RequestTypes["route"]]: Handler<R> }
  init: () => Api
  handleClose: (ws: ServerWebSocket<PerClientData>) => void
  handleOpen: (ws: ServerWebSocket<PerClientData>) => void
  handleMessage: (ws: ServerWebSocket<PerClientData>, data: Buffer) => void
}

export const Api = (): Api => {

  const prisma = new PrismaClient()
  const JWT_SECRET = process.env["JWT_SECRET"] ?? "piggo"
  const google = new OAuth2Client("1064669120093-9727dqiidriqmrn0tlpr5j37oefqdam3.apps.googleusercontent.com")

  const skiplog: RequestTypes["route"][] = ["meta/players", "auth/login"]

  const verifyJWT = (data: { token: string }): SessionToken | false => {
    let token: SessionToken | undefined = undefined
    try {
      token = jwt.verify(data.token, JWT_SECRET) as SessionToken
      if (token) return token
    } catch (e) {
      console.error("JWT verification failed", e)
    }
    return false
  }

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
        const lobbyId = randomHash()

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
      "meta/players": async ({ data }) => {
        return { id: data.id, online: keys(api.clients).length }
      },
      "friends/add": async ({ ws, data }) => {
        const token = verifyJWT(data)
        if (!token) return { id: data.id, error: "Auth failed" }

        if (ws.data.playerName === data.name) {
          return { id: data.id, error: "That's you, silly" }
        }

        const user = await prisma.users.findUnique({ where: { name: data.name } })
        if (!user) return { id: data.id, error: "User not found" }

        const friend = await prisma.friends.findFirst({
          where: {
            user1: { googleId: token.googleId },
            user2Id: data.name
          }
        })

        if (friend) {
          if (friend.status === "ACCEPTED") {
            return { id: data.id, error: "Already friends" }
          }
          if (friend.status === "PENDING") {
            return { id: data.id, error: "Friend request already sent" }
          }
          if (friend.status === "BLOCKED") {
            return { id: data.id, error: "User blocked" }
          }
        } else {
          await prisma.friends.create({
            data: {
              user1: { connect: { googleId: token.googleId } },
              user2: { connect: { name: data.name } },
              status: "PENDING"
            }
          })
        }

        return { id: data.id }
      },
      "friends/list": async ({ data }) => {
        let result: { id: string, friends: Record<string, Friend> } = { friends: {}, id: data.id }

        let token: SessionToken | undefined = undefined

        try {
          token = jwt.verify(data.token, JWT_SECRET) as SessionToken
        } catch (e) {
          return { id: data.id, error: "Auth failed" }
        }

        const user = await prisma.users.findUnique({ where: { googleId: token.googleId } })
        if (!user) return { id: data.id, error: "User not found" }

        const friends = await prisma.friends.findMany({
          where: { user1: user, NOT: { status: "BLOCKED" } },
          include: { user2: true }
        })

        for (const { user2, status } of friends) {
          const online = Boolean(values(api.clients).find((client) => {
            return client.data.playerName === user2.name
          }))
          result.friends[user2.name] = { name: user2.name, online, status }
        }

        return result
      },
      "friends/remove": async ({ data }) => {
        return { id: data.id }
      },
      "profile/get": async ({ ws, data }) => {
        const token = verifyJWT(data)
        if (!token) return { id: data.id, error: "Auth failed" }

        // 2. find user
        const user = await prisma.users.findUnique({ where: { googleId: token.googleId } })
        if (!user) return { id: data.id, error: "User not found" }

        // 3. update websocket playerName
        ws.data.playerName = user.name

        // 4. update player entity name
        const pc = api.worlds[ws.data.worldId]?.world.entity(ws.data.playerId)?.components.pc
        if (pc) pc.data.name = user.name

        return { id: data.id, name: user.name }
      },
      "profile/create": async ({ data }) => {
        let token: SessionToken | undefined = undefined

        // 1. verify jwt
        try {
          token = jwt.verify(data.token, JWT_SECRET) as SessionToken
        } catch (e) {
          return { id: data.id, error: "Auth failed" }
        }

        // 2. check if username is taken
        const oldUser = await prisma.users.findUnique({ where: { name: data.name } })
        if (oldUser) return { id: data.id, error: "Username already taken" }

        // 3. create user
        const newUser = await prisma.users.create({
          data: { name: data.name, googleId: token.googleId }
        })

        return { id: data.id, name: newUser.name }
      },
      "auth/login": async ({ ws, data }) => {

        // 1. verify google jwt
        const ticket = await google.verifyIdToken({
          idToken: data.jwt,
          audience: "1064669120093-9727dqiidriqmrn0tlpr5j37oefqdam3.apps.googleusercontent.com"
        })

        const { sub } = ticket.getPayload() ?? {}

        if (!sub) {
          return { id: data.id, error: "Google Auth failed" }
        }

        let newUser = false

        // 2. set state if user exists
        let user = await prisma.users.findUnique({ where: { googleId: sub } })
        if (user) {
          ws.data.playerName = user.name
          const pc = api.worlds[ws.data.worldId]?.world.entity(ws.data.playerId)?.components.pc
          if (pc) pc.data.name = user.name
        } else {
          newUser = true
        }

        // 3. create session token
        const token = jwt.sign({ googleId: sub }, JWT_SECRET, { expiresIn: "8h" })

        return { id: data.id, token, newUser }
      },
      "ai/pls": async ({ data }) => {
        // const response = await gptPrompt(data.prompt)
        return { id: data.id, response: [] }
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
          return server.upgrade(r, { data: { ip: r.headers.get("x-forwarded-for") } }) ? new Response() : new Response("upgrade failed", { status: 500 })
        },
        websocket: {
          perMessageDeflate: false,
          close: api.handleClose,
          open: api.handleOpen,
          message: api.handleMessage,
        }
      })

      return api
    },
    handleClose: (ws: ServerWebSocket<PerClientData>) => {
      const world = api.worlds[ws.data.worldId]
      if (world) world.handleClose(ws)

      if (ws.data.ip) console.log("client disconnected", ws.data.ip)

      delete api.clients[ws.data.id]
    },
    handleOpen: (ws: ServerWebSocket<PerClientData>) => {
      // set data for this client
      ws.data = { id: api.clientIncr, worldId: "", playerName: "noob", playerId: "", ip: ws.data.ip }

      if (ws.data.ip) console.log("client connected", ws.data.ip)

      // add client to clients
      api.clients[ws.data.id] = ws

      // increment id
      api.clientIncr += 1
    },
    handleMessage: (ws: ServerWebSocket<PerClientData>, data: Buffer) => {
      const wsData = decode(data) as NetMessageTypes
      if (!wsData.type) return

      if (wsData.type === "request") {
        const handler = api.handlers[wsData.data.route]

        if (handler) {
          if (!skiplog.includes(wsData.data.route)) {
            // @ts-expect-error
            const { token, ...loggable } = wsData.data
            console.log("request", stringify(loggable))
          }

          const start = performance.now()

          // @ts-expect-error
          const result = handler({ ws, data: wsData.data }) // TODO fix type casting
          result.then((data) => {
            if (!skiplog.includes(wsData.data.route)) {
              console.log(`response ms:${round(performance.now() - start)}`, stringify(data))
            }
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
