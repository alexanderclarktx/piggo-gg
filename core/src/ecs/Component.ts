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
  // serialize: () => NetworkedComponentData
  // deserialize: (data: NetworkedComponentData) => void
}

// type ComponentNoSerialize = Omit<Omit<Component, "serialize">, "deserialize">

// export const Component = <C extends ComponentNoSerialize>(c: C): Component => ({
//   ...c,
//   serialize: () => {
//     let data: NetworkedComponentData = {};
//     Object.keys(c.data).forEach((key) => data[key] = c.data[key]);
//     return data;
//   },
//   deserialize: (data) => {
//     for (const [key, value] of Object.entries(data)) {
//       c.data[key] = value;
//     }
//   }
// })

// 個 gè (generic measure word)
// a Component is an atomic unit of data that is attached to an entity
// export abstract class Component<T extends string = string> {
//   abstract type: T;

//   data: NetworkedComponentData = {};

//   // serializes data from component
//   serialize: () => NetworkedComponentData = () => {
//     let data: NetworkedComponentData = {};
//     Object.keys(this.data).forEach((key) => data[key] = this.data[key]);

//     return data;
//   }

//   // copies networked data to the component
//   deserialize: (data: NetworkedComponentData) => void = (data) => {
//     for (const [key, value] of Object.entries(data)) {
//       this.data[key] = value;
//     }
//   }
// }
