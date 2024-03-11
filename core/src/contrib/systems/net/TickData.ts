import { SerializedEntity } from "@piggo-gg/core";

export type TickData = {
  type: "game"
  tick: number
  timestamp: number
  player: string
  actions: Record<number, Record<string, string[]>>
  chats: Record<number, Record<string, string[]>>
  serializedEntities: Record<string, SerializedEntity>
  latency?: number
}
