import { Actions, Clickable, Collider, Controlling, Data, Debug, Effects, Expires, Gun, Health, Input, NPC, Networked, Player, Position, Renderable, Team } from "@piggo-gg/core";

export type ComponentTypes =
  Actions | Clickable | Collider | Controlling |
  Data | Debug | Effects | Expires | Health |
  Input | Team | Networked | NPC | Player |
  Position | Renderable | Gun

export type NetworkedComponentData = Record<string, boolean | string | number | string[] | number[]>

export type Component<type extends string = string> = {
  type: type
  data?: NetworkedComponentData
}

export const serializeComponent = (c: Component): NetworkedComponentData => {
  let data: NetworkedComponentData = {};
  if (!c.data) return data;

  Object.keys(c.data).forEach((key) => data[key] = c.data![key]);
  return data;
}

export const deserializeComponent = (c: Component, data: NetworkedComponentData): void => {
  for (const [key, value] of Object.entries(data)) {
    c.data![key] = value;
  }
}
