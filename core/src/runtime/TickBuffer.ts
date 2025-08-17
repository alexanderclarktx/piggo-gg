import { entries, keys } from "@piggo-gg/core"

export type TickBuffer<T extends ({} | string)> = {
  fresh: Set<number>
  at: (tick: number, entityId: string) => T[] | undefined
  atTick: (tick: number) => Record<string, T[]> | undefined
  clearTick: (tick: number) => void
  clearBeforeTick: (tick: number) => void
  fromTick: (tick: number, filter?: (state: T) => boolean) => Record<number, Record<string, T[]>>
  keys: () => number[]
  set: (tick: number, entityId: string, state: T[]) => void
  push: (tick: number, entityId: string, state: T) => boolean
}

export const TickBuffer = <T extends ({} | string)>(): TickBuffer<T> => {

  const buffer: Record<number, Record<string, T[]>> = {}

  const tickBuffer: TickBuffer<T> = {
    fresh: new Set(),
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
      for (const key of keys(buffer)) {
        if (Number(key) < tick) {
          delete buffer[Number(key)]
        }
      }
    },
    fromTick: (tick, filter: (state: T) => boolean = () => true) => {
      const data: Record<number, Record<string, T[]>> = {}

      for (const [index, value] of entries(buffer)) {
        if (Number(index) >= tick) {
          data[Number(index)] = {}
          for (const [entityId, states] of entries(value)) {
            data[Number(index)][entityId] = states.filter(filter)
          }
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

      // update fresh
      tickBuffer.fresh.add(tick)
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

      // update fresh
      tickBuffer.fresh.add(tick)

      // push state
      buffer[tick][entityId].push(state)
      return true
    }
  }
  return tickBuffer
}
