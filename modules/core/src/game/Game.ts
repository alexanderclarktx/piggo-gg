import { Renderer, Entity, System, RtcPool } from "@piggo-legends/core";

export type GameProps = {
  net?: RtcPool,
  renderer?: Renderer,
  entities?: Record<string, Entity>,
  systems?: System[]
}

export abstract class Game<T extends GameProps = GameProps> {
  net: RtcPool | undefined = undefined;
  renderer: Renderer | undefined = undefined;
  entities: Record<string, Entity> = {};
  systems: System[] = [];
  tick: number = 0;

  constructor({ net, renderer, systems = [] }: T) {
    this.net = net;
    this.renderer = renderer;
    this.systems = systems;

    setInterval(this.onTick, 1000 / 60);
  }

  addEntity = (entity: Entity) => {
    this.entities[entity.id] = entity;
    return entity.id;
  }

  removeEntity = (id: string) => {
    if (this.entities[id]) {
      delete this.entities[id];
    }
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

    this.systems?.forEach((system) => {
      system.onTick(this.filterEntitiesForSystem(system, Object.values(this.entities)));
    });
  }
}
