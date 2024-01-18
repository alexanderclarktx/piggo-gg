import { Renderer, Entity, System, RtcPool, SystemBuilder } from "@piggo-legends/core";

export type GameProps = {
  net?: RtcPool,
  renderer?: Renderer,
  entities?: Record<string, Entity>,
  systems?: System[]
  renderMode?: "cartesian" | "isometric"
  runtimeMode?: "client" | "server"
}

export abstract class Game<T extends GameProps = GameProps> {
  net: RtcPool | undefined = undefined;
  renderer: Renderer | undefined = undefined;
  entities: Record<string, Entity> = {};
  systems: System[] = [];
  tick: number = 0;
  renderMode: "cartesian" | "isometric";
  runtimeMode: "client" | "server";
  debug: boolean = false;

  lastTick: DOMHighResTimeStamp = 0;

  thisPlayerId = `player${(Math.random() * 100).toFixed(0)}`;

  constructor({ net, renderer, systems, renderMode, runtimeMode }: T) {
    this.net = net;
    this.renderer = renderer;
    this.systems = systems ?? [],
    this.renderMode = renderMode ?? "cartesian";
    this.runtimeMode = runtimeMode ?? "client";

    if (this.runtimeMode === "client") {
      requestAnimationFrame(this.onTick);
    } else {
      setInterval(this.onTick, 1000 / 30);
    }
  }

  addEntity = (entity: Entity) => {
    this.entities[entity.id] = entity;
    return entity.id;
  }

  addEntities = (entities: Entity[]) => {
    entities.forEach((entity) => {
      this.addEntity(entity);
    });
  }

  removeEntity = (id: string) => {
    const entity = this.entities[id];
    if (entity) {
      delete this.entities[id];
      entity.components.renderable?.cleanup();
    }
  }

  addSystems = (systems: System[]) => {
    this.systems.push(...systems);
  }

  addSystemBuilders = (systemBuilders: SystemBuilder[]) => {
    systemBuilders.forEach((systemBuilder) => {
      this.systems.push(systemBuilder({ game: this, renderer: this.renderer, net: this.net, thisPlayerId: this.thisPlayerId, mode: this.renderMode }));
    });
  }

  filterEntitiesForSystem = (query: string[], entities: Entity[]): Entity[] => {
    return entities.filter((e) => {
      for (const componentType of query) {
        if (!Object.keys(e.components).includes(componentType)) return false;
      }
      return true;
    });
  }

  onTick = (time: DOMHighResTimeStamp) => {

    // skip if 1000 / 30 ms has not passed
    if (this.runtimeMode === "client" && (time - this.lastTick) < (1000 / 30)) {
      if (requestAnimationFrame) requestAnimationFrame(this.onTick);
      console.log("skip");
      return;
    }

    // update the last tick time
    this.lastTick = this.lastTick + (1000 / 30);

    // increment tick
    this.tick += 1;

    // run system updates
    this.systems?.forEach((system) => {
      system.componentTypeQuery ? system.onTick(this.filterEntitiesForSystem(system.componentTypeQuery, Object.values(this.entities))) : system.onTick([]);
    });

    // callback
    if (this.runtimeMode === "client") requestAnimationFrame(this.onTick);
  }
}
