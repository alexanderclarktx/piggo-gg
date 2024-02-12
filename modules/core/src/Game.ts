import { Renderer, Entity, System, RtcPool, SystemBuilder, SerializedEntity, deserializeEntity, Zombie, Ball, Player, Networked, Skelly, Controlling } from "@piggo-legends/core";

const hz30 = 1000 / 30;

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

  entitiesAtTick: Record<number, Record<string, Entity>> = {};

  lastTick: DOMHighResTimeStamp = 0;
  thisPlayerId = `player${(Math.random() * 100).toFixed(0)}`;

  constructor({ net, renderer, systems, renderMode, runtimeMode }: T) {
    this.net = net;
    this.renderer = renderer;
    this.systems = systems ?? [],
    this.renderMode = renderMode ?? "cartesian";
    this.runtimeMode = runtimeMode ?? "client";

    setInterval(this.onTick, hz30);
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

  addEntityBuilders = (entityBuilders: (() => Entity)[]) => {
    entityBuilders.forEach((entityBuilder) => {
      this.addEntity(entityBuilder());
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

  rollback = (rollbackEntities: Record<string, SerializedEntity>, tick: number, ticksForward: number) => {

    console.log("rollback", this.tick, tick);

    // set tick
    this.tick = tick;

    // rollback entities
    Object.keys(this.entities).forEach((entityId) => {
      if (this.entities[entityId].components.networked) {

        if (!rollbackEntities[entityId]) {
          // delete if not present in rollback frame
          console.log("DELETE ENTITY", entityId, rollbackEntities);
          this.removeEntity(entityId);
        }
      }
    });

    // add new entities if not present locally
    Object.keys(rollbackEntities).forEach((entityId) => {
      if (!this.entities[entityId]) {
        if (entityId.startsWith("zombie")) {
          console.log("ADD ZOMBIE FROM SERVER", entityId);
          this.addEntity(Zombie(entityId));
        } else if (entityId.startsWith("ball")) {
          console.log("ADD BALL FROM SERVER", entityId);
          const ball = Ball({ id: entityId });
          console.log("BALL", ball);
          this.addEntity(ball);
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
          console.log("ADD SKELLY FROM SERVER", entityId, rollbackEntities[entityId]);
          Skelly(entityId).then((skelly) => {
            this.addEntity(skelly);
          });
        } else {
          console.log("ADD ENTITY FROM SERVER UNKNOWN", entityId);
        }
      }
    });

    // deserialize everything
    Object.keys(rollbackEntities).forEach((entityId) => {
      if (this.entities[entityId] && rollbackEntities[entityId]) {
        deserializeEntity(this.entities[entityId], rollbackEntities[entityId]);
      }
    });

    // run system updates
    for (let i = 0; i < ticksForward; i++) {

      // increment tick
      this.tick += 1;

      // run system updates
      this.systems?.forEach((system) => {
        if (!system.skipOnRollback) {
          system.componentTypeQuery ? system.onTick(this.filterEntitiesForSystem(system.componentTypeQuery, Object.values(this.entities))) : system.onTick([]);
        }
      });
    }
  }

  filterEntitiesForSystem = (query: string[], entities: Entity[]): Entity[] => {
    return entities.filter((e) => {
      for (const componentType of query) {
        if (!Object.keys(e.components).includes(componentType)) return false;
      }
      return true;
    });
  }

  onTick = () => {
    // update the last tick time
    this.lastTick = this.lastTick + hz30;

    // increment tick
    this.tick += 1;

    // run system updates
    this.systems?.forEach((system) => {
      system.componentTypeQuery ? system.onTick(this.filterEntitiesForSystem(system.componentTypeQuery, Object.values(this.entities))) : system.onTick([]);
    });
  }
}
