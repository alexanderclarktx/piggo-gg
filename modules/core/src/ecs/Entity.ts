import { Actions, Clickable, Collider, Controlled, Controller, Controlling, Debug, Health, NPC, Name, Networked, Player, Position, Renderable } from "@piggo-legends/core";

// TODO how to make this extendable
type ComponentTypes =
Actions | Clickable | Collider |
Controller | Controlled | Controlling |
Debug | Health | Name | Networked | NPC |
Player | Position | Renderable

// 集 jí (set) - an Entity is a uniquely identified set of Components
// all components are optional except the provided ones
export interface Entity<T extends ComponentTypes = ComponentTypes> {
  id: string;
  components: ComponentTypes extends T ? {
    [P in ComponentTypes['type']]?: Extract<ComponentTypes, { type: P }>
  } : {
    [P in T['type']]: Extract<T, { type: P }>
  } & {
    [P in Exclude<ComponentTypes['type'], T['type']>]?: Extract<ComponentTypes, { type: P }>
  }
}
