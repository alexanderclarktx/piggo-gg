import { entries, keys } from "@piggo-gg/core"

export type TickBuffer<T extends ({} | string)> = {
  at: (tick: number, entityId: string) => T[] | undefined
  atTick: (tick: number) => Record<string, T[]> | undefined
  clearTick: (tick: number) => void
  clearBeforeTick: (tick: number) => void
  fromTick: (tick: number) => Record<number, Record<string, T[]>>
  keys: () => number[]
  set: (tick: number, entityId: string, state: T[]) => void
  push: (tick: number, entityId: string, state: T) => boolean
}

export const TickBuffer = <T extends ({} | string)>(): TickBuffer<T> => {

  const buffer: Record<number, Record<string, T[]>> = {}

  const TickBuffer: TickBuffer<T> = {
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
    fromTick: (tick) => {
      const data: Record<number, Record<string, T[]>> = {}

      for (const [index, value] of entries(buffer)) {
        if (Number(index) >= tick) {
          data[Number(index)] = value
        }
      }

      return data
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

      // check if state already exists
      for (const s of buffer[tick][entityId]) {
        if (JSON.stringify(s) === JSON.stringify(state)) return false
      }

      // push state
      buffer[tick][entityId].push(state)
      return true
    }
  }
  return TickBuffer
}
