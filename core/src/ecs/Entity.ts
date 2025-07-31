import {
  Component, ComponentTypes, NetworkedComponentData, deserializeComponent,
  entries, keys, serializeComponent, values
} from "@piggo-gg/core"

// an Entity is a uniquely identified set of Components
export type Entity<T extends ComponentTypes = ComponentTypes> = {
  id: string
  serialize: () => SerializedEntity
  deserialize: (serializedEntity: SerializedEntity) => void
  removed: boolean
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

export type ProtoEntity<T extends ComponentTypes = ComponentTypes> = Omit<Entity<T>, "serialize" | "deserialize" | "removed">

export const Entity = <T extends ComponentTypes>(protoEntity: ProtoEntity<T>): Entity<T> => {

  const entity: Entity<T> = {
    ...protoEntity,
    removed: false,
    serialize: () => {
      const serializedEntity: SerializedEntity = {}

      const sortedComponents = values(protoEntity.components).sort((a: Component, b: Component) => a.type.localeCompare(b.type))
      sortedComponents.forEach((component: Component<string, NetworkedComponentData>) => {
        const serializedComponent = serializeComponent(component)
        if (keys(serializedComponent).length) {
          serializedEntity[component.type] = { ...serializedComponent }
        }
      })

      return serializedEntity
    },
    deserialize: (serializedEntity: SerializedEntity) => deserializeEntity(entity, serializedEntity)
  }

  return entity
}

export const deserializeEntity = (entity: ProtoEntity, serializedEntity: SerializedEntity): void => {

  // deprecated
  keys(serializedEntity).forEach((type) => {
    if (!(type in entity.components)) {
      console.error(`MISSING COMPONENT type=${type} entity=${entity.id}`)
    }
  })

  entries(serializedEntity).forEach(([type, serializedComponent]) => {
    if (type in entity.components) {
      // @ts-expect-error
      deserializeComponent(entity.components[type], serializedComponent)
    }
  })
}
