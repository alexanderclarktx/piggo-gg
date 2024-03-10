import { Component, ComponentTypes, Controlling } from "@piggo-gg/core";

// 集 jí (set)
// an Entity is a uniquely identified set of Components
export type Entity<T extends ComponentTypes = ComponentTypes> = {
  id: string
  serialize: () => SerializedEntity
  deserialize: (serializedEntity: SerializedEntity) => void
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

type ProtoEntity<T extends ComponentTypes = ComponentTypes> = Omit<Entity<T>, "serialize" | "deserialize">

export const Entity = <T extends ComponentTypes>(e: ProtoEntity<T>): Entity<T> => {
  return {
    ...e,
    serialize: () => {
      const serializedEntity: SerializedEntity = {};
      Object.values(e.components).forEach((component: Component) => {
        const serializedComponent = component.serialize();
        if (Object.keys(serializedComponent).length) {
          serializedEntity[component.type] = serializedComponent;
        }
      });
      return serializedEntity;
    },
    deserialize: (serializedEntity: SerializedEntity) => deserializeEntity(e, serializedEntity)
    // deserialize: (serializedEntity: SerializedEntity) => {
    //   Object.keys(serializedEntity).forEach((type) => {
    // }
  }
}

export const deserializeEntity = (entity: ProtoEntity, serializedEntity: SerializedEntity) : void => {

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
