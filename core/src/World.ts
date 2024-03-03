import { StateBuffer, Ball, Data, Entity, Networked, Noob, Renderer, SerializedEntity, Skelly, System, SystemBuilder, SystemEntity, TickData, Zombie, deserializeEntity, serializeEntity } from "@piggo-gg/core";

export type WorldProps = {
  renderMode: "cartesian" | "isometric"
  runtimeMode: "client" | "server"
  renderer?: Renderer | undefined
  clientPlayerId?: string | undefined
}

export type WorldBuilder = (_: Omit<WorldProps, "renderMode">) => World;

export type World = {
  actionBuffer: StateBuffer
  chatHistory: StateBuffer
  clientPlayerId: string | undefined
  debug: boolean
  entities: Record<string, Entity>
  entitiesAtTick: Record<number, Record<string, SerializedEntity>>
  isConnected: boolean
  lastTick: DOMHighResTimeStamp
  ms: number
  renderer: Renderer | undefined
  renderMode: "cartesian" | "isometric"
  runtimeMode: "client" | "server"
  systems: Record<string, System>
  tick: number
  tickrate: number
  addEntities: (entities: Entity[]) => void
  addEntity: (entity: Entity) => string
  addEntityBuilders: (entityBuilders: (() => Entity)[]) => void
  addSystemBuilders: (systemBuilders: SystemBuilder[]) => void
  addSystems: (systems: System[]) => void
  onRender: () => void
  onTick: (_: { isRollback: boolean }) => void
  removeEntity: (id: string) => void
  rollback: (td: TickData) => void
}

export const World = ({ renderMode, runtimeMode, renderer, clientPlayerId }: WorldProps): World => {

  const scheduleOnTick = () => setTimeout(() => world.onTick({ isRollback: false }), 3);

  const filterEntities = (query: string[], entities: Entity[]): Entity[] => {
    return entities.filter((e) => {
      for (const componentType of query) {
        if (!Object.keys(e.components).includes(componentType)) return false;
      }
      return true;
    });
  }

  const world: World = {
    actionBuffer: StateBuffer(),
    chatHistory: StateBuffer(),
    clientPlayerId,
    debug: false,
    entities: {},
    entitiesAtTick: {},
    isConnected: false,
    lastTick: 0,
    ms: 0,
    renderer,
    renderMode,
    runtimeMode,
    systems: {},
    tick: 0,
    tickrate: 25,
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
    addSystems: (systems: System[]) => {
      systems.forEach((system) => {
        if (world.systems[system.id]) {
          console.error(`not inserting duplicate system id ${system.id}`);
          return;
        }
        world.systems[system.id] = system;
        if (system.data) {
          world.addEntity(SystemEntity({ systemId: system.id, data: system.data }));
        }
      })
    },
    addSystemBuilders: (systemBuilders: SystemBuilder[]) => {
      const systems = systemBuilders.map((systemBuilder) => systemBuilder({ world, renderer: renderer, clientPlayerId: world.clientPlayerId, mode: renderMode }));
      world.addSystems(systems);
    },
    onRender: () => {
      Object.values(world.systems).forEach((system) => {
        if (system.onRender) {
          system.onRender(filterEntities(system.query ?? [], Object.values(world.entities)));
        }
      });
    },
    onTick: ({ isRollback }) => {
      const now = performance.now();

      // check whether it's time to calculate the next tick
      if (!isRollback && ((world.lastTick + world.tickrate) > now)) {
        scheduleOnTick();
        return;
      }

      // update lastTick
      if (!isRollback) {
        if ((now - world.tickrate - world.tickrate) > world.lastTick) {
          // catch up (browser was delayed)
          world.lastTick = now;
        } else {
          // move forward at fixed timestep
          world.lastTick += world.tickrate;
        }
      }

      // increment tick
      world.tick += 1;

      // store serialized entities before systems run
      const serializedEntities: Record<string, SerializedEntity> = {}
      for (const entityId in world.entities) {
        if (world.entities[entityId].components.networked) {
          serializedEntities[entityId] = serializeEntity(world.entities[entityId]);
        }
      }
      world.entitiesAtTick[world.tick] = serializedEntities;

      // run system updates
      Object.values(world.systems).forEach((system) => {
        if (!isRollback || (isRollback && !system.skipOnRollback)) {
          system.query ? system.onTick(filterEntities(system.query, Object.values(world.entities)), isRollback) : system.onTick([], isRollback);
        }
      });

      // schedule onTick
      if (!isRollback) scheduleOnTick();

      // clear old buffered data
      world.actionBuffer.clearBeforeTick(world.tick - 200);
      Object.keys(world.entitiesAtTick).forEach((tick) => {
        if ((world.tick - Number(tick)) > 200) {
          delete world.entitiesAtTick[Number(tick)];
        }
      });
    },
    rollback: (td: TickData) => {
      const now = Date.now();

      // determine how many ticks to increment
      let framesAhead = Math.ceil((((world.ms) / world.tickrate) * 2) + 4);
      if (Math.abs(framesAhead - (world.tick - td.tick)) <= 1) framesAhead = world.tick - td.tick;

      console.log(`ms:${world.ms} msgFrame:${td.tick} clientFrame:${world.tick} targetFrame:${td.tick + framesAhead}`);

      // set tick
      world.tick = td.tick - 1;

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
            world.addEntity(Zombie({ id: entityId }));
          } else if (entityId.startsWith("ball")) {
            world.addEntity(Ball({ id: entityId }));
          } else if (entityId.startsWith("player")) {
            world.addEntity(Noob({ id: entityId }))
          } else if (entityId.startsWith("skelly")) {
            world.addEntity(Skelly(entityId));
          } else {
            console.error("UNKNOWN ENTITY ON SERVER", entityId);
          }
        }
      });

      // deserialize everything
      Object.keys(td.serializedEntities).forEach((entityId) => {
        if (world.entities[entityId] && td.serializedEntities[entityId]) {
          deserializeEntity(world.entities[entityId], td.serializedEntities[entityId]);
        }
      });

      // update local action buffer
      Object.keys(td.actions).forEach((tickString) => {
        const tick = Number(tickString);
        Object.keys(td.actions[tick]).forEach((entityId) => {
          // skip future actions for controlled entities
          if (tick > td.tick && world.entities[entityId]?.components.controlled?.data.entityId === world.clientPlayerId) return;

          world.actionBuffer.set(tick, entityId, td.actions[tick][entityId]);
        });
      });

      Object.values(world.systems).forEach((system) => system.onRollback ? system.onRollback() : null);

      // run system updates
      for (let i = 0; i < framesAhead + 1; i++) world.onTick({ isRollback: true });

      console.log(`rollback took ${Date.now() - now}ms`);
    }
  }

  // setup callbacks
  scheduleOnTick();
  if (renderer) renderer.app.ticker.add(world.onRender);

  return world;
}
