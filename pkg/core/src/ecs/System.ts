import { Entity, EntityProps, Game, GameProps } from "@piggo-legends/core";

export type SystemProps = {}

// a System is a function that is applied to all entities that have a certain set of components
export abstract class System<T extends SystemProps> {
  props: T;

  constructor(props: T) {
    this.props = props;
  }

  abstract componentTypeQuery: string[];

  abstract onTick: (entities: Entity<EntityProps>[], game: Game<GameProps>) => void;

  getFilteredEntities = (entities: Entity<EntityProps>[]) => {
    return entities.filter((e) => {
      for (const componentType of this.componentTypeQuery) {
        if (!Object.keys(e.props.components).includes(componentType)) return false;
      }
      return true;
    });
  }
}
