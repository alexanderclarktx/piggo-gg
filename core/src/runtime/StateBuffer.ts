export type StateBuffer = {
  at: (tick: number, entityId: string) => string[] | undefined
  atTick: (tick: number) => Record<string, string[]> | undefined
  clearTick: (tick: number) => void
  clearBeforeTick: (tick: number) => void
  keys: () => number[]
  set: (tick: number, entityId: string, actions: string[]) => void
  push: (tick: number, entityId: string, actions: string) => boolean
}

export const StateBuffer = (): StateBuffer => {

  const buffer: Record<number, Record<string, string[]>> = {};

  const StateBuffer: StateBuffer = {
    at: (tick, entityId) => {
      return buffer[tick] ? buffer[tick][entityId] : undefined
    },
    atTick: (tick) => {
      return buffer[tick];
    },
    clearTick: (tick) => {
      delete buffer[tick];
    },
    clearBeforeTick: (tick) => {
      Object.keys(buffer).map(Number).forEach((t) => {
        if (t < tick) delete buffer[t];
      });
    },
    keys: () => {
      return Object.keys(buffer).map(Number).reverse();
    },
    set: (tick, entityId, actions) => {
      // empty buffer for tick if it doesn't exist
      if (!buffer[tick]) buffer[tick] = {};

      // set actions for entity
      buffer[tick][entityId] = actions;
    },
    push: (tick, entityId, action) => {
      // empty buffer for tick if it doesn't exist
      if (!buffer[tick]) buffer[tick] = {};

      // empty buffer for entity if it doesn't exist
      if (!buffer[tick][entityId]) buffer[tick][entityId] = [];

      // push action
      buffer[tick][entityId].push(action);
      return true;
    }
  }
  return StateBuffer;
}
