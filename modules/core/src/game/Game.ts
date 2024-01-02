import { Renderer, Entity, System, RtcPool, SystemBuilder } from "@piggo-legends/core";

export type GameProps = {
  net?: RtcPool,
  renderer?: Renderer,
  entities?: Record<string, Entity>,
  systems?: System[]
  mode?: "cartesian" | "isometric"
}

export abstract class Game<T extends GameProps = GameProps> {
  net: RtcPool | undefined = undefined;
  renderer: Renderer | undefined = undefined;
  entities: Record<string, Entity> = {};
  systems: System[] = [];
  tick: number = 0;
  mode: "cartesian" | "isometric" = "cartesian";

  thisPlayerId = `player${(Math.random() * 100).toFixed(0)}`;

  constructor({ net, renderer, systems = [], mode = "cartesian" }: T) {
    this.net = net;
    this.renderer = renderer;
    this.systems = systems;
    this.mode = mode;

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
    this.systems.push(...systems);
  }

  addSystemBuilders = (systemBuilders: SystemBuilder[]) => {
    systemBuilders.forEach((systemBuilder) => {
      this.systems.push(systemBuilder({ game: this, renderer: this.renderer, net: this.net, thisPlayerId: this.thisPlayerId, mode: this.mode }));
    });
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
