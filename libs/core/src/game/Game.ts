import { Renderer, Entity, System, RtcPool } from "@piggo-legends/core";

export type GameProps = {
  net: RtcPool,
  renderer: Renderer,
  entities: Record<string, Entity>,
  systems?: System[]
}

export abstract class Game<T extends GameProps> {
  props: T;
  tick: number = 0;

  constructor(props: T) {
    this.props = props;
    this._init();
  }

  addEntity = (entity: Entity) => {
    this.props.entities[entity.id] = entity;
  }

  _init = () => {
    this.props.renderer.app.ticker.add(this.onTick);
  }

  filterEntitiesForSystem = (system: System, entities: Entity[]): Entity[] => {
    return entities.filter((e) => {
      for (const componentType of system.componentTypeQuery) {
        if (!Object.keys(e.components).includes(componentType)) return false;
      }
      return true;
    });
  }

  onTick = () => {
    this.tick += 1;

    // call each system onTick
    this.props.systems?.forEach((system) => {
      system.onTick(this.filterEntitiesForSystem(system, Object.values(this.props.entities)), this);
    });
  }
}
