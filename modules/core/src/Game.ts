import { Ball, Controlling, Entity, Networked, Player, Renderer, RtcPool, SerializedEntity, Skelly, System, SystemBuilder, TickData, Zombie, deserializeEntity, serializeEntity, world } from "@piggo-legends/core";

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
  tickrate = 1000 / 32;

  lastTick: DOMHighResTimeStamp = 0;
  entitiesAtTick: Record<number, Record<string, SerializedEntity>> = {};

  thisPlayerId = `player${(Math.random() * 100).toFixed(0)}`;

  constructor({ net, renderer, systems, renderMode, runtimeMode }: T) {
    this.net = net;
    this.renderer = renderer;
    this.systems = systems ?? [];
    this.renderMode = renderMode ?? "cartesian";
    this.runtimeMode = runtimeMode ?? "client";

    setTimeout(this.onTick, 8);
  }

  addEntity = (entity: Entity) => {
    this.entities[entity.id] = entity;
    return entity.id;
  }

  addEntities = (entities: Entity[]) => {
    entities.forEach((entity) => this.addEntity(entity));
  }

  addEntityBuilders = (entityBuilders: (() => Entity)[]) => {
    entityBuilders.forEach((entityBuilder) => this.addEntity(entityBuilder()));
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

  filterEntities = (query: string[], entities: Entity[]): Entity[] => {
    return entities.filter((e) => {
      for (const componentType of query) {
        if (!Object.keys(e.components).includes(componentType)) return false;
      }
      return true;
    });
  }

  onTick = (isRollback: boolean = false) => {
    // check whether it's time to calculate the next tick
    if (!isRollback) {
      if ((this.lastTick + this.tickrate) > performance.now()) {
        setTimeout(this.onTick, 8);
        return;
      }
    }

    // TODO is this broken during rollback
    // increment lastTick
    if (!isRollback) this.lastTick += this.tickrate;

    // increment tick
    this.tick += 1;

    // run system updates
    this.systems.forEach((system) => {
      if (!isRollback || (isRollback && !system.skipOnRollback)) {
        system.query ? system.onTick(this.filterEntities(system.query, Object.values(this.entities))) : system.onTick([]);
      }
    });

    // store serialized entities
    const serializedEntities: Record<string, SerializedEntity> = {}
    for (const entityId in this.entities) {
      if (this.entities[entityId].components.networked) {
        serializedEntities[entityId] = serializeEntity(this.entities[entityId]);
      }
    }
    this.entitiesAtTick[this.tick] = serializedEntities;

    // call onTick again
    if (!isRollback) setTimeout(this.onTick, 8);
  }

  // roll back the game state
  rollback = ({ tick, serializedEntities }: TickData, ticksForward: number) => {

    console.log(`rollback client:${this.tick} server:${tick}`);
    // console.log(JSON.stringify(Object.keys(rollbackEntities)));
    if (this.entitiesAtTick[tick]) {
      // console.log(Object.keys(rollbackEntities).length, Object.keys(this.entitiesAtTick[tick]).length);
    }

    // set tick
    this.tick = tick;

    // set lastTick
    this.lastTick = performance.now();

    // remove old local entities
    Object.keys(this.entities).forEach((entityId) => {
      if (this.entities[entityId].components.networked) {

        if (!serializedEntities[entityId]) {
          // delete if not present in rollback frame
          console.log("DELETE ENTITY", entityId, serializedEntities);
          this.removeEntity(entityId);
        }
      }
    });

    // add new entities if not present locally
    Object.keys(serializedEntities).forEach((entityId) => {
      if (!this.entities[entityId]) {
        if (entityId.startsWith("zombie")) {
          console.log("ADD ZOMBIE FROM SERVER", entityId);
          this.addEntity(Zombie(entityId));
        } else if (entityId.startsWith("ball")) {
          console.log("ADD BALL FROM SERVER", entityId);
          this.addEntity(Ball({ id: entityId }));
        } else if (entityId.startsWith("player")) {
          console.log("ADD PLAYER FROM SERVER", entityId);
          const player: Entity = {
            id: entityId,
            components: {
              networked: new Networked({ isNetworked: true }),
              player: new Player({ name: entityId }),
              controlling: new Controlling({ entityId: "" })
            }
          };
          this.addEntity(player);
        } else if (entityId.startsWith("skelly")) {
          console.log("ADD SKELLY FROM SERVER", entityId, serializedEntities[entityId]);
          this.addEntity(Skelly(entityId));
        } else {
          console.log("ADD ENTITY FROM SERVER UNKNOWN", entityId);
        }
      }
    });

    // deserialize everything
    Object.keys(serializedEntities).forEach((entityId) => {
      if (this.entities[entityId] && serializedEntities[entityId]) {
        deserializeEntity(this.entities[entityId], serializedEntities[entityId]);
      }
    });

    // run system updates
    for (let i = 0; i < ticksForward; i++) {
      this.onTick(true);
    }
  }
}
