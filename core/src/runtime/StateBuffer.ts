import { keys } from "@piggo-gg/core"

export type StateBuffer<T extends ({} | string)> = {
  at: (tick: number, entityId: string) => T[] | undefined
  atTick: (tick: number) => Record<string, T[]> | undefined
  clearTick: (tick: number) => void
  clearBeforeTick: (tick: number) => void
  keys: () => number[]
  set: (tick: number, entityId: string, state: T[]) => void
  push: (tick: number, entityId: string, state: T) => boolean
}

export const StateBuffer = <T extends ({} | string)>(): StateBuffer<T> => {

  const buffer: Record<number, Record<string, T[]>> = {}

  const StateBuffer: StateBuffer<T> = {
    at: (tick, entityId) => {
      return buffer[tick] ? buffer[tick][entityId] : undefined
    },
    atTick: (tick) => {
      return buffer[tick]
    },
    clearTick: (tick) => {
      delete buffer[tick]
    },
    clearBeforeTick: (tick) => {
      for (let i = 0; i < tick; i++) {
        delete buffer[i]
      }
    },
    keys: () => {
      return keys(buffer).map(Number).reverse()
    },
    set: (tick, entityId, state) => {
      // empty buffer for tick if it doesn't exist
      if (!buffer[tick]) buffer[tick] = {}

      // set state for entity
      buffer[tick][entityId] = state
    },
    push: (tick, entityId, state) => {
      // empty buffer for tick if it doesn't exist
      if (!buffer[tick]) buffer[tick] = {}

      // empty buffer for entity if it doesn't exist
      if (!buffer[tick][entityId]) buffer[tick][entityId] = []

      // push state
      buffer[tick][entityId].push(state)
      return true
    }
  }
  return StateBuffer
}
