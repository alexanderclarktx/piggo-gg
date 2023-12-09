import { Renderer, Entity, System, RtcPool } from "@piggo-legends/core";

export type GameProps = {
  net: RtcPool,
  renderer: Renderer,
  entities?: Record<string, Entity>,
  systems?: System[]
}

export abstract class Game<T extends GameProps = GameProps> {
  net: RtcPool;
  renderer: Renderer;
  entities: Record<string, Entity> = {};
  systems: System[] = [];
  tick: number = 0;

  constructor({ net, renderer }: T) {
    this.net = net;
    this.renderer = renderer;

    this.renderer.app.ticker.add(this.onTick);
  }

  addEntity = (entity: Entity) => {
    this.entities[entity.id] = entity;
    return entity.id;
  }

  addSystems = (systems: System[]) => {
    systems.forEach((system) => { this.systems.push(system) });
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
    this.systems?.forEach((system) => {
      system.onTick(this.filterEntitiesForSystem(system, Object.values(this.entities)), this);
    });
  }
}
