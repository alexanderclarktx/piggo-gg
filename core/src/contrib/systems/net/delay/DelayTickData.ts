import { InvokedAction, SerializedEntity } from "@piggo-gg/core";

type BaseRequest = {
  type: "request"
  id: string
}

export type LobbyList = BaseRequest & {
  route: "lobby/list"
  response: {}
}

export type LobbyCreate = BaseRequest & {
  route: "lobby/create"
  response: {}
}

export type LobbyJoin = BaseRequest & {
  route: "lobby/join"
  response: {}
}

export type LobbyExit = BaseRequest & {
  route: "lobby/exit"
  response: {}
}

export type ClientRequest = LobbyList | LobbyCreate | LobbyJoin | LobbyExit

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
