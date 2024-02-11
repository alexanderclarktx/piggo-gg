import { Actions, Clickable, Collider, Controlled, Controller, Controlling, Debug, Health, NPC, Name, Networked, Player, Position, Renderable } from "@piggo-legends/core";

// TODO how to make this extendable
type ComponentTypes =
  Actions | Clickable | Collider |
  Controller | Controlled | Controlling |
  Debug | Health | Name | Networked | NPC |
  Player | Position | Renderable

// 集 jí (set)
// an Entity is a uniquely identified set of Components
export interface Entity<T extends ComponentTypes = ComponentTypes> {
  id: string
  components: ComponentTypes extends T ?
  {
    // all components optional
    [P in ComponentTypes['type']]?: Extract<ComponentTypes, { type: P }>
  } : {
    // provided components are required, the rest are optional
    [P in T['type']]: Extract<T, { type: P }> } & {
    [P in Exclude<ComponentTypes['type'], T['type']>]?: Extract<ComponentTypes, { type: P }>
  }
}

// < entityId, 
export type SerializedEntityZ = Record<string, Record<string, string | number>>

export const serializeEntity = (entity: Entity): SerializedEntityZ => {
  const serializedEntity: SerializedEntityZ = {};
  Object.values(entity.components).forEach((component) => {
    if (component.serialize) {
      serializedEntity[component.type] = component.serialize();
    }
  });
  // if (entity.components.position) {
  //   serializedEntity.position = serializePosition(entity.components.position);
  // }
  return serializedEntity;
}

export const deserializeEntity = (entity: Entity, serializedEntity: SerializedEntityZ) => {
  Object.values(entity.components).forEach((component) => {
    if (component.deserialize) {
      component.deserialize(serializedEntity[component.type]);
    }
  });
  // if (entity.components.position) {
  //   deserializePosition(entity.components.position, serializedEntity.position);
  // }
}
