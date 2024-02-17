import { Actions, Clickable, ColliderRJS, Controlled, Controller, Controlling, Data, Debug, Health, NPC, Name, Networked, Player, Position, Renderable } from "@piggo-legends/core";

// TODO how to make this extendable
export type ComponentTypes =
  Actions | Clickable | ColliderRJS |
  Controller | Controlled | Controlling |
  Data | Debug | Health | Name | Networked |
  NPC | Player | Position | Renderable

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

export type SerializedEntity = Record<string, Record<string, string | number>>

export const serializeEntity = (entity: Entity): SerializedEntity => {
  const serializedEntity: SerializedEntity = {};
  Object.values(entity.components).forEach((component) => {
    const serializedComponent = component.serialize();
    if (Object.keys(serializedComponent).length) {
      serializedEntity[component.type] = serializedComponent;
    }
  });
  return serializedEntity;
}

export const deserializeEntity = (entity: Entity, serializedEntity: SerializedEntity) : void => {

  // add new components if necessary
  Object.keys(serializedEntity).forEach((type) => {
    if (!(type in entity.components)) {
      console.log(`adding component ${type}`);
      if (type === "controlling") {
        console.log("adding controlling");
        entity.components.controlling = new Controlling();
      }
    }
  });

  // update existing components
  Object.values(entity.components).forEach((component) => {
    if (component.type in serializedEntity) {
      component.deserialize(serializedEntity[component.type]);
    }
  });  
}
