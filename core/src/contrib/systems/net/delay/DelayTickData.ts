import { InvokedAction, SerializedEntity } from "@piggo-gg/core";

type BaseRequest = {
  type: "request"
  id: string
}

export type LobbyList = BaseRequest & {
  route: "lobby/list"
  response: {
    id: string
  }
}

export type LobbyCreate = BaseRequest & {
  route: "lobby/create"
  response: {
    id: string
  }
}

export type LobbyJoin = BaseRequest & {
  route: "lobby/join"
  code: string
  response: {
    id: string
  }
}

export type LobbyExit = BaseRequest & {
  route: "lobby/exit"
  response: {
    id: string
  }
}

export type LobbyListRequest = Omit<LobbyList, "response">
export type LobbyCreateRequest = Omit<LobbyCreate, "response">
export type LobbyJoinRequest = Omit<LobbyJoin, "response">
export type LobbyExitRequest = Omit<LobbyExit, "response">

export type ClientRequest = LobbyList | LobbyCreate | LobbyJoin | LobbyExit

export type ExtractedRequestTypes<T extends ClientRequest['route']> = Extract<ClientRequest, { route: T }>;

export type DelayTickData = GameData | LobbiesData

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

export type LobbiesData = {
  type: "lobbies"
  lobbies: Record<string, number> // player count per lobby
}
