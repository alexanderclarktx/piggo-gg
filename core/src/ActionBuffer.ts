import { World } from "@piggo-legends/core";

export type ActionBuffer = {
  buffer: Record<number, Record<string, string[]>>
  clearTick: (tick: number) => void
  setActions: (tick: number, entityId: string, actions: string[]) => void
  addAction: (tick: number, entityId: string, actions: string) => boolean
}

export const ActionBuffer = (): ActionBuffer => {
  const actionBuffer: ActionBuffer = {
    buffer: {},
    clearTick: (tick) => {
      delete actionBuffer.buffer[tick];
    },
    setActions: (tick, entityId, actions) => {
      // empty buffer for tick if it doesn't exist
      if (!actionBuffer.buffer[tick]) actionBuffer.buffer[tick] = {};

      actionBuffer.buffer[tick][entityId] = actions;
    },
    addAction: (tick, entityId, action) => {
      // tick += 1;

      // empty buffer for tick if it doesn't exist
      if (!actionBuffer.buffer[tick]) actionBuffer.buffer[tick] = {};

      // empty buffer for entity if it doesn't exist
      if (!actionBuffer.buffer[tick][entityId]) actionBuffer.buffer[tick][entityId] = [];

      // don't add action if it already exists
      if (actionBuffer.buffer[tick][entityId].includes(action)) return false;

      actionBuffer.buffer[tick][entityId].push(action);
      return true;
    }
  }
  return actionBuffer;
}
