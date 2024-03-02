export type ActionBuffer = {
  at: (tick: number, entityId: string) => string[] | undefined
  atTick: (tick: number) => Record<string, string[]> | undefined
  clearTick: (tick: number) => void
  clearBeforeTick: (tick: number) => void
  keys: () => number[]
  setActions: (tick: number, entityId: string, actions: string[]) => void
  pushAction: (tick: number, entityId: string, actions: string) => boolean
}

export const ActionBuffer = (): ActionBuffer => {

  const buffer: Record<number, Record<string, string[]>> = {};

  const actionBuffer: ActionBuffer = {
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
      Object.keys(buffer).forEach((t) => {
        if (Number(t) < tick) delete buffer[Number(t)];
      });
    },
    keys: () => {
      return Object.keys(buffer).map(Number).reverse();
    },
    setActions: (tick, entityId, actions) => {
      // empty buffer for tick if it doesn't exist
      if (!buffer[tick]) buffer[tick] = {};

      // set actions for entity
      buffer[tick][entityId] = actions;
    },
    pushAction: (tick, entityId, action) => {
      // empty buffer for tick if it doesn't exist
      if (!buffer[tick]) buffer[tick] = {};

      // empty buffer for entity if it doesn't exist
      if (!buffer[tick][entityId]) buffer[tick][entityId] = [];

      // don't add action if it already exists
      if (buffer[tick][entityId].includes(action)) return false;

      // push action
      buffer[tick][entityId].push(action);
      return true;
    }
  }
  return actionBuffer;
}
