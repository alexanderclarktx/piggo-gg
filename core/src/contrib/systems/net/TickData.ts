import { SerializedEntity } from "@piggo-gg/core";

export type TickData = {
  type: "game"
  tick: number
  timestamp: number
  latency?: number
  player: string
  actions: Record<number, Record<string, string[]>>
  chats: Record<number, Record<string, string[]>>
  serializedEntities: Record<string, SerializedEntity>
}

export type DelayTickData = {
  type: "game"
  tick: number
  timestamp: number
  latency?: number
  player: string
  actions: Record<string, string[]>
  chats: Record<string, string[]>
  serializedEntities: Record<string, SerializedEntity>
}
