import { Ball, Controlling, Entity, Networked, Player, Renderer, SerializedEntity, Skelly, System, SystemBuilder, TickData, Zombie, deserializeEntity, serializeEntity } from "@piggo-legends/core";

export type WorldProps = {
  renderMode: "cartesian" | "isometric"
  runtimeMode: "client" | "server"
  renderer?: Renderer | undefined
  clientPlayerId?: string | undefined
}

export type World = {
  renderMode: "cartesian" | "isometric"
  runtimeMode: "client" | "server"
  debug: boolean
  tick: number
  lastTick: DOMHighResTimeStamp
  clientPlayerId: string | undefined
  renderer: Renderer | undefined
  entities: Record<string, Entity>
  systems: System[]
  entitiesAtTick: Record<number, Record<string, SerializedEntity>>
  addEntity: (entity: Entity) => string;
  addEntities: (entities: Entity[]) => void;
  addEntityBuilders: (entityBuilders: (() => Entity)[]) => void;
  removeEntity: (id: string) => void;
  addSystems: (systems: System[]) => void;
  addSystemBuilders: (systemBuilders: SystemBuilder[]) => void;
  onRender?: () => void;
  onTick: (isRollback?: boolean) => void;
  rollback: (td: TickData) => void;
}

export const PiggoWorld = ({ renderMode, runtimeMode, renderer, clientPlayerId }: WorldProps): World => {

  const tickrate = 1000 / 32;

  const filterEntities = (query: string[], entities: Entity[]): Entity[] => {
    return entities.filter((e) => {
      for (const componentType of query) {
        if (!Object.keys(e.components).includes(componentType)) return false;
      }
      return true;
    });
  }

  const world: World = {
    renderMode,
    runtimeMode,
    clientPlayerId,
    debug: false,
    tick: 0,
    lastTick: 0,
    renderer,
    entities: {},
    systems: [],
    entitiesAtTick: {},
    addEntity: (entity: Entity) => {
      world.entities[entity.id] = entity;
      return entity.id;
    },
    addEntities: (entities: Entity[]) => {
      entities.forEach((entity) => world.addEntity(entity));
    },
    addEntityBuilders: (entityBuilders: (() => Entity)[]) => {
      entityBuilders.forEach((entityBuilder) => world.addEntity(entityBuilder()));
    },
    removeEntity: (id: string) => {
      const entity = world.entities[id];
      if (entity) {
        delete world.entities[id];
        entity.components.renderable?.cleanup();
      }
    },
    addSystems: (systems: System[]) => { world.systems.push(...systems) },
    addSystemBuilders: (systemBuilders: SystemBuilder[]) => {
      systemBuilders.forEach((systemBuilder) => {
        world.systems.push(systemBuilder({ world, renderer: renderer, clientPlayerId: world.clientPlayerId, mode: renderMode }));
      });
    },
    onRender: () => {
      world.systems.forEach((system) => {
        if (system.onRender) {
          system.onRender(filterEntities(system.query ?? [], Object.values(world.entities)));
        }
      });
    },
    onTick: (isRollback: boolean = false) => {

      // check whether it's time to calculate the next tick
      if (!isRollback) {
        if ((world.lastTick + tickrate) > performance.now()) {
          setTimeout(world.onTick, 8);
          return;
        }
      }
  
      // TODO is this broken during rollback
      // increment world.lastTick
      if (!isRollback) world.lastTick += tickrate;
  
      // increment tick
      world.tick += 1;
  
      // run system updates
      world.systems.forEach((system) => {
        if (!isRollback || (isRollback && !system.skipOnRollback)) {
          system.query ? system.onTick(filterEntities(system.query, Object.values(world.entities))) : system.onTick([]);
        }
      });
  
      // store serialized entities
      const serializedEntities: Record<string, SerializedEntity> = {}
      for (const entityId in world.entities) {
        if (world.entities[entityId].components.networked) {
          serializedEntities[entityId] = serializeEntity(world.entities[entityId]);
        }
      }
      world.entitiesAtTick[world.tick] = serializedEntities;
  
      // call onTick again
      if (!isRollback) setTimeout(world.onTick, 8);
    },
    rollback: (td: TickData) => {

      console.log(`rollback client:${world.tick} server:${td.tick}`);
      // console.log(JSON.stringify(Object.keys(rollbackEntities)));
      if (world.entitiesAtTick[world.tick]) {
        // console.log(Object.keys(rollbackEntities).length, Object.keys(entitiesAtTick[tick]).length);
      }
  
      const ticksForward = 5;
  
      // set tick
      world.tick = td.tick;
  
      // set world.lastTick
      world.lastTick = performance.now();
  
      // remove old local entities
      Object.keys(world.entities).forEach((entityId) => {
        if (world.entities[entityId].components.networked) {
  
          if (!td.serializedEntities[entityId]) {
            // delete if not present in rollback frame
            console.log("DELETE ENTITY", entityId, td.serializedEntities);
            world.removeEntity(entityId);
          }
        }
      });
  
      // add new entities if not present locally
      Object.keys(td.serializedEntities).forEach((entityId) => {
        if (!world.entities[entityId]) {
          if (entityId.startsWith("zombie")) {
            console.log("ADD ZOMBIE FROM SERVER", entityId);
            world.addEntity(Zombie(entityId));
          } else if (entityId.startsWith("ball")) {
            console.log("ADD BALL FROM SERVER", entityId);
            world.addEntity(Ball({ id: entityId }));
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
            world.addEntity(player);
          } else if (entityId.startsWith("skelly")) {
            console.log("ADD SKELLY FROM SERVER", entityId, td.serializedEntities[entityId]);
            world.addEntity(Skelly(entityId));
          } else {
            console.log("ADD ENTITY FROM SERVER UNKNOWN", entityId);
          }
        }
      });
  
      // deserialize everything
      Object.keys(td.serializedEntities).forEach((entityId) => {
        if (world.entities[entityId] && td.serializedEntities[entityId]) {
          deserializeEntity(world.entities[entityId], td.serializedEntities[entityId]);
        }
      });
  
      // run system updates
      for (let i = 0; i < ticksForward; i++) {
        world.onTick(true);
      }
    }
  }

  // setup callbacks
  setTimeout(world.onTick, 8);
  if (renderer && world.onRender) renderer.app.ticker.add(world.onRender);

  return world;
}
