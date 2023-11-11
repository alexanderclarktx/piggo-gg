import { Renderer, Entity, System, SystemProps, RtcPool } from "@piggo-legends/core";

export type GameProps = {
  net: RtcPool,
  renderer: Renderer,
  entities: Record<string, Entity>,
  systems?: System<SystemProps>[]
}

export abstract class Game<T extends GameProps> {
  props: T;
  tick: number = 0;
  otherPlayer: Entity;

  constructor(props: T) {
    this.props = props;
    this._init();
  }

  addEntity = (entity: Entity) => {
    this.props.entities[entity.id] = entity;
  }

  _init = () => {
    // ontick
    this.props.renderer.app.ticker.add(this.onTick);
  }

  onTick = () => {
    this.tick += 1;

    // systems onTick
    this.props.systems?.forEach((system) => {
      system.onTick(system.getFilteredEntities(Object.values(this.props.entities)), this);
    });
  }
}
