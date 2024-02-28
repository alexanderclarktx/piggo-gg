import { Command, SerializedEntity } from "@piggo-legends/core";

export type TickData = {
  type: "game"
  tick: number
  timestamp: number
  player: string
  commands: Record<number, Record<string, Command[]>>
  serializedEntities: Record<string, SerializedEntity>
  latency?: number
  // lastReceivedMessage?: {
  //   tick: number
  //   timestamp: number
  //   localTimestamp: number
  // }
}
