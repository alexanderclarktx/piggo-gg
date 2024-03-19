import {
  Ball, Entity, Game, GameBuilder, Noob, Renderer,
  SerializedEntity, Skelly, StateBuffer, System,
  SystemBuilder, SystemEntity, TickData, Zombie
} from "@piggo-gg/core";

export type WorldProps = {
  renderMode: "cartesian" | "isometric"
  runtimeMode: "client" | "server"
  games?: GameBuilder[]
  renderer?: Renderer | undefined
  clientPlayerId?: string | undefined
}

export type WorldBuilder = (_: Omit<WorldProps, "renderMode">) => World;

export type World = {
  actionBuffer: StateBuffer
  chatHistory: StateBuffer
  clientPlayerId: string | undefined
  currentGame: Game
  debug: boolean
  entities: Record<string, Entity>
  entitiesAtTick: Record<number, Record<string, SerializedEntity>>
  games: Record<string, GameBuilder>
  isConnected: boolean
  lastTick: DOMHighResTimeStamp
  ms: number
  framesAhead: number
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
  removeSystem: (id: string) => void
  rollback: (td: TickData) => void
  setGame: (game: GameBuilder) => void
}

export const World = ({ renderMode, runtimeMode, games, renderer, clientPlayerId }: WorldProps): World => {

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
    currentGame: { id: "", entities: [], systems: [] },
    debug: false,
    entities: {},
    entitiesAtTick: {},
    games: {},
    isConnected: false,
    lastTick: 0,
    ms: 0,
    framesAhead: 0,
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
    removeSystem: (id: string) => {
      const system = world.systems[id];
      if (system) delete world.systems[id];
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
      systemBuilders.forEach((systemBuilder) => {
        if (!world.systems[systemBuilder.id]) {
          const system = systemBuilder.init({ world, renderer: renderer, clientPlayerId: world.clientPlayerId, mode: renderMode });
          world.addSystems([system]);
        }
      })
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
          serializedEntities[entityId] = world.entities[entityId].serialize();
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
      Object.keys(world.entitiesAtTick).map(Number).forEach((tick) => {
        if ((world.tick - tick) > 200) {
          delete world.entitiesAtTick[tick];
        }
      });
    },
    rollback: (td: TickData) => {
      const now = Date.now();

      // determine how many ticks to increment
      world.framesAhead = Math.ceil((((world.ms) / world.tickrate) * 2) + 1);
      if (Math.abs(world.framesAhead - (world.tick - td.tick)) <= 1) {
        world.framesAhead = world.tick - td.tick;
      }

      console.log(`ms:${world.ms} msgFrame:${td.tick} clientFrame:${world.tick} targetFrame:${td.tick + world.framesAhead}`);

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
          } else if (entityId.startsWith("noob")) {
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
        if (world.entities[entityId]) {
          console.log("deserialize", entityId, td.serializedEntities[entityId]);
          world.entities[entityId].deserialize(td.serializedEntities[entityId]);
        }
      });

      // update local action buffer
      Object.keys(td.actions).map(Number).forEach((tick) => {
        Object.keys(td.actions[tick]).forEach((entityId) => {
          // skip future actions for controlled entities
          if (tick > td.tick && world.entities[entityId]?.components.controlled?.data.entityId === world.clientPlayerId) return;

          world.actionBuffer.set(tick, entityId, td.actions[tick][entityId]);
        });
      });

      Object.values(world.systems).forEach((system) => system.onRollback ? system.onRollback() : null);

      // run system updates
      for (let i = 0; i < world.framesAhead + 1; i++) world.onTick({ isRollback: true });

      console.log(`rollback took ${Date.now() - now}ms`);
    },
    setGame: (gameBuilder: GameBuilder) => {

      // remove old entities
      Object.values(world.entities).forEach((entity) => {
        if (!entity.persists) world.removeEntity(entity.id);
      });

      // remove old systems
      world.currentGame.systems.forEach((system) => world.removeSystem(system.id));

      // set new game
      world.currentGame = gameBuilder.init(world);

      // initialize new game
      world.addEntities(world.currentGame.entities);
      world.addSystemBuilders(world.currentGame.systems);
    }
  }

  // setup callbacks
  scheduleOnTick();
  if (renderer) renderer.app.ticker.add(world.onRender);
  if (games) {
    games.forEach((game) => world.games[game.id] = game);
    if (games[0]) world.setGame(games[0]);
  }

  return world;
}
