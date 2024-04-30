import { InvokedAction, SerializedEntity } from "@piggo-gg/core";

export type DelayTickData = GameData

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
