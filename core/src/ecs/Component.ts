import { Actions, Clickable, Collider, Controlling, Data, Debug, Effects, Expires, Gun, Health, Input, NPC, Networked, Player, Position, Renderable, Team, entries, keys } from "@piggo-gg/core";

export type ComponentTypes =
  Actions | Clickable | Collider | Controlling |
  Data | Debug | Effects | Expires | Health |
  Input | Team | Networked | NPC | Player |
  Position | Renderable | Gun

export type NetworkedComponentData = Record<string, boolean | string | number | string[] | number[]>

// 個 gè (generic measure word)
// a Component is an atomic unit of data that is attached to an entity
export type Component<type extends string = string> = {
  type: type
  data?: NetworkedComponentData
}

export const serializeComponent = (c: Component): NetworkedComponentData => {
  let data: NetworkedComponentData = {};
  if (!c.data) return data;

  keys(c.data).forEach((key) => data[key] = c.data![key]);
  return data;
}

export const deserializeComponent = (c: Component, data: NetworkedComponentData): void => {
  for (const [key, value] of entries(data)) {
    c.data![key] = value;
  }
}
