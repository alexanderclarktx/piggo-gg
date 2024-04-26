import { Actions, Clickable, Collider, Controlled, Controller, Controlling, Data, Debug, Gun, Health, NPC, Name, Networked, NetworkedEntityData, Player, Position, Renderable } from "@piggo-gg/core";

export type ComponentTypes =
  Actions | Clickable | Collider |
  Controller | Controlled | Controlling |
  Data | Debug | Health | Name | Networked |
  NPC | Player | Position | Renderable | Gun

// 個 gè (generic measure word)
// a Component is an atomic unit of data that is attached to an entity
export abstract class Component<T extends string = string> {
  abstract type: T;

  data: NetworkedEntityData = {};

  // serializes data from component
  serialize: () => Record<string, string | number | string[] | number[]> = () => {
    let data: Record<string, string | number | string[] | number[]> = {};
    Object.keys(this.data).forEach((key) => data[key] = this.data[key]);

    return data;
  }

  // copies networked data to the component
  deserialize: (data: Record<string, string | number | string[] | number[]>) => void = (data) => {
    for (const [key, value] of Object.entries(data)) {
      this.data[key] = value;
    }
  }
}
