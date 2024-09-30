import {
  Actions, Clickable, Collider, Controlling, Data, Debug, Name,
  Effects, Expires, Gun, Health, Input, NPC, Networked, Player,
  Position, Renderable, Team, Money, XY, entries, keys, Inventory,
  Edible, Element
} from "@piggo-gg/core";

export type ComponentTypes =
  Actions | Clickable | Collider | Controlling | Element |
  Data | Debug | Effects | Expires | Health | Edible |
  Input | Team | Networked | NPC | Player | Name |
  Position | Renderable | Gun | Money | Inventory

export type NetworkedComponentData = Record<string, boolean | string | number | string[] | number[] | XY>

// 個 gè (generic measure word)
// a Component is an atomic unit of data that is attached to an entity
export type Component<type extends string = string, D extends NetworkedComponentData | undefined = undefined> = {
  type: type
} & (D extends undefined ? {} : { data: D })

export const serializeComponent = (c: Component<string, NetworkedComponentData>): NetworkedComponentData => {
  let data: NetworkedComponentData = {};
  if (!c.data) return data;

  keys(c.data).forEach((key) => data[key] = c.data![key]);
  return data;
}

export const deserializeComponent = (c: Component<string, NetworkedComponentData>, data: NetworkedComponentData): void => {
  for (const [key, value] of entries(data)) {
    c.data[key] = value;
  }
}
