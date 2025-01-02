import { InvokedAction, SerializedEntity, World, genHash } from "@piggo-gg/core"

export type Syncer = {
  handleMessage: (world: World, gameData: GameData) => void
  writeMessage: (world: World) => GameData
}

export type Request<Route extends string, Response extends {} = {}> = {
  type: "request"
  id: string
  route: Route
  response: Response & { id: string, error?: string }
}

export type LobbyList = Request<"lobby/list">
export type LobbyCreate = Request<"lobby/create", { lobbyId: string }>
export type LobbyJoin = Request<"lobby/join"> & { join: string }
export type LobbyExit = Request<"lobby/exit">

export type LobbyListRequest = Omit<LobbyList, "response">
export type LobbyCreateRequest = Omit<LobbyCreate, "response">
export type LobbyJoinRequest = Omit<LobbyJoin, "response">
export type LobbyExitRequest = Omit<LobbyExit, "response">

export const LobbyJoinRequest = (join: string): LobbyJoinRequest => ({
  type: "request", id: genHash(), route: "lobby/join", join
})

export const LobbyCreateRequest = (): LobbyCreateRequest => ({
  type: "request", id: genHash(), route: "lobby/create"
})

export type RequestData = {
  type: "request"
  request: Omit<RequestTypes, "response">
}
export type ResponseData = {
  type: "response"
  response: RequestTypes["response"]
}

export type RequestTypes = LobbyList | LobbyCreate | LobbyJoin | LobbyExit
export type ExtractedRequestTypes<T extends RequestTypes['route']> = Extract<RequestTypes, { route: T }>

export type NetMessageTypes = GameData | RequestData | ResponseData

export type GameData = {
  type: "game"
  actions: Record<string, InvokedAction[]>
  chats: Record<string, string[]>
  game: string
  latency?: number
  player: string
  serializedEntities: Record<string, SerializedEntity>
  tick: number
  timestamp: number
}

export type RollbackTickData = {
  type: "game"

  actions: Record<number, Record<string, InvokedAction[]>>

  chats: Record<number, Record<string, string[]>>
  latency?: number
  player: string
  serializedEntities: Record<string, SerializedEntity>
  tick: number
  timestamp: number
}
