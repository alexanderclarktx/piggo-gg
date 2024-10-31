import {
  Actions, Clickable, Collider, Controlling, Data, Debug,
  Effects, Expires, Gun, Health, Input, NPC, Networked, Player,
  Position, Renderable, Team, Money, XY, entries, keys, Inventory,
  Food, Element, Item
} from "@piggo-gg/core";

export type ComponentTypes =
  Actions | Clickable | Collider | Controlling | Element |
  Data | Debug | Effects | Expires | Health | Food |
  Input | Team | Networked | NPC | Player |
  Position | Renderable | Gun | Money | Inventory | Item

export type ValidComponents = ComponentTypes["type"]

export type NetworkedComponentData = Record<string, undefined | boolean | string | number | string[] | number[] | XY>

// a Component is an atomic unit of data that is attached to an entity
export type Component<type extends string = string, D extends NetworkedComponentData | undefined = undefined> = {
  type: type
  active?: boolean
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
