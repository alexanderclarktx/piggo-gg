import { Entity, Game, GameProps, Renderer } from "@piggo-legends/core";

export type SystemProps = {
  renderer: Renderer
}

// a System is a function that is applied to all entities that have a certain set of components
export abstract class System<T extends SystemProps = SystemProps> {
  props: T;

  abstract componentTypeQuery: string[];
  abstract onTick: (entities: Entity[], game: Game<GameProps>) => void;

  constructor(props: T) {
    this.props = props;
  }

  // filters entities for those containing all required components
  getFilteredEntities = (entities: Entity[]) => {
    return entities.filter((e) => {
      for (const componentType of this.componentTypeQuery) {
        if (!Object.keys(e.components).includes(componentType)) return false;
      }
      return true;
    });
  }
}
