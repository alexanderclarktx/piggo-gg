import {
  Actions, Clickable, Collider, Controlling, Data, Debug, Effects,
  Expires, Gun, Health, Input, NPC, Networked, PC, Position,
  Renderable, Team, Money, XY, entries, Inventory, Food, Element, Item
} from "@piggo-gg/core"

export type ComponentTypes =
  Actions | Clickable | Collider | Controlling | Element |
  Data | Debug | Effects | Expires | Health | Food |
  Input | Team | Networked | NPC | PC |
  Position | Renderable | Gun | Money | Inventory | Item

export type ValidComponents = ComponentTypes["type"]

export type NetworkedComponentData = Record<string,
  undefined |
  boolean |
  string |
  number |
  string[] |
  number[] |
  (string[] | undefined)[] | XY
>

// a Component is an atomic unit of data that is attached to an entity
export type Component<type extends string = string, D extends NetworkedComponentData | undefined = undefined> = {
  type: type
  active?: boolean
} & (D extends undefined ? {} : { data: D })

export const serializeComponent = (c: Component<string, NetworkedComponentData>): NetworkedComponentData => {
  let data: NetworkedComponentData = {}
  if (!c.data) return data

  for (const [key, value] of entries(c.data)) {
    if (value === undefined) continue
    if (typeof value === "object") {
      data[key] = { ...value }
    } else {
      data[key] = value
    }
  }

  return data
}

export const deserializeComponent = (c: Component<string, NetworkedComponentData>, data: NetworkedComponentData): void => {
  for (const [key, value] of entries(data)) {
    if (typeof value === "object") {
      c.data[key] = { ...value }
    } else {
      c.data[key] = value
    }
  }
}
