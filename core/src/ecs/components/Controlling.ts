import { Actions, Component, Entity, Input, Position, Renderable, World } from "@piggo-gg/core";

export type Character = Entity<Position | Input | Actions | Renderable>

export type Controlling = Component<"controlling", { entityId: string }> & {
  getControlledEntity: (world: World) => undefined | Character
}

export type ControllingProps = {
  entityId?: string
}

export const Controlling = (props: ControllingProps): Controlling => {
  const controlling: Controlling = {
    type: "controlling",
    data: {
      entityId: props.entityId ?? ""
    },
    getControlledEntity: (world: World) => {
      const character = world.entities[controlling.data.entityId];
      if (!character) return undefined;

      const { position, input, actions, renderable } = character.components;
      if (!position || !input || !actions || !renderable) return undefined;

      return character as Character;
    }
  }
  return controlling;
}
