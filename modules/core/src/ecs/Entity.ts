import { Actions, Clickable, Collider, Controlled, Controller, Controlling, Health, NPC, Name, Networked, Player, Position, Renderable } from "@piggo-legends/contrib";

type ComponentTypes =
Actions | Clickable | Collider |
Controller | Controlled | Controlling |
Health | Name | Networked | NPC | Player |
Position | Renderable

// 集 jí (set) - an Entity is a uniquely identified set of Components
// note: if no generic is provided, all components are present and optional, otherwise the components are required
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
