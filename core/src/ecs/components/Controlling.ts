import { Actions, Collider, Component, Entity, Input, Position, Renderable, SystemBuilder, Team, World } from "@piggo-gg/core"

export type Character = Entity<Position | Collider | Input | Actions | Team>
export const Character = Entity<Position | Collider | Input | Actions | Team>

export type Controlling = Component<"controlling", { entityId: string }> & {
  getCharacter: (world: World) => Character | undefined
}

export type ControllingProps = {
  entityId?: string
}

export const Controlling = (props: ControllingProps = {}): Controlling => {
  const controlling: Controlling = {
    type: "controlling",
    data: {
      entityId: props.entityId ?? ""
    },
    getCharacter: (world: World) => {
      const character = world.entities[controlling.data.entityId]
      if (!character) return undefined

      const { position, input, actions, renderable } = character.components
      if (!position || !input || !actions || !renderable) return undefined

      return character as Character
    }
  }
  return controlling
}

export const ControlSystem = SystemBuilder({
  id: "ControlSystem",
  init: (world) => ({
    id: "ControlSystem",
    query: ["controlling"],
    priority: 2,
    onTick: (entities: Entity<Controlling>[]) => {
      entities.forEach((entity) => {
        const character = entity.components.controlling.getCharacter(world)

        if (!character) {
          entity.components.controlling.data.entityId = ""
        }
      })
    }
  })
})
