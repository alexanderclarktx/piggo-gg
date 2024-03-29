import { InvokedAction, SerializedEntity } from "@piggo-gg/core";

export type DelayTickData = {
  actions: Record<string, InvokedAction[]>
  chats: Record<string, string[]>
  game: string
  latency?: number
  player: string
  serializedEntities: Record<string, SerializedEntity>
  tick: number
  timestamp: number
  type: "game"
}
