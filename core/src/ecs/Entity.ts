import { Actions, Clickable, Collider, Component, ComponentTypes, Controlled, Controller, Controlling, Data, Debug, Gun, Health, NPC, Name, Networked, NetworkedComponentData, Player, Position, Renderable } from "@piggo-gg/core";

// 集 jí (set)
// an Entity is a uniquely identified set of Components
export type Entity<T extends ComponentTypes = ComponentTypes> = {
  id: string
  extend: (_: ComponentTypes[]) => Entity<T>
  serialize: () => SerializedEntity
  deserialize: (serializedEntity: SerializedEntity) => void
  persists?: boolean
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

export type SerializedEntity = Record<string, NetworkedComponentData>

export type ProtoEntity<T extends ComponentTypes = ComponentTypes> = Omit<Entity<T>, "serialize" | "deserialize" | "extend">

export const Entity = <T extends ComponentTypes>(protoEntity: ProtoEntity<T>): Entity<T> => {

  const entity = {
    ...protoEntity,
    extend: (components: ComponentTypes[]) => {
      components.forEach((component) => {
        // @ts-expect-error
        entity.components[component.type] = component;
      });
      return entity;
    },
    serialize: () => {
      const serializedEntity: SerializedEntity = {};

      const sortedComponents = Object.values(protoEntity.components).sort((a: Component, b: Component) => a.type.localeCompare(b.type));
      sortedComponents.forEach((component: Component) => {
        const serializedComponent = component.serialize();
        if (Object.keys(serializedComponent).length) {
          serializedEntity[component.type] = serializedComponent;
        }
      });
      return serializedEntity;
    },
    deserialize: (serializedEntity: SerializedEntity) => deserializeEntity(entity, serializedEntity)
  }

  return entity
}

export const deserializeEntity = (entity: ProtoEntity, serializedEntity: SerializedEntity): void => {

  // add new components if necessary
  Object.entries(serializedEntity).forEach(([type, data]) => {
    if (!(type in entity.components)) {
      if (type === "controlling") {
        console.log("adding controlling");
        entity.components.controlling = new Controlling();
      } else {
        console.error(`failed to add component: ${type}`);
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
