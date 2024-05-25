import { Actions, Clickable, Collider, Input, Controlling, Data, Debug, Expires, Gun, Health, NPC, Networked, Player, Position, Renderable, Team } from "@piggo-gg/core";

export type ComponentTypes =
  Actions | Clickable | Collider | Input |
  Controlling | Data | Debug | Expires | Health |
  Team | Networked | NPC | Player |
  Position | Renderable | Gun

export type NetworkedComponentData = Record<string, boolean | string | number | string[] | number[]>

// 個 gè (generic measure word)
// a Component is an atomic unit of data that is attached to an entity
export abstract class Component<T extends string = string> {
  abstract type: T;

  data: NetworkedComponentData = {};

  // serializes data from component
  serialize: () => NetworkedComponentData = () => {
    let data: NetworkedComponentData = {};
    Object.keys(this.data).forEach((key) => data[key] = this.data[key]);

    return data;
  }

  // copies networked data to the component
  deserialize: (data: NetworkedComponentData) => void = (data) => {
    for (const [key, value] of Object.entries(data)) {
      this.data[key] = value;
    }
  }
}
