import { Command, Entity, Game, GameBuilder, InvokedAction, Renderer, SerializedEntity, StateBuffer, System, SystemBuilder, SystemEntity } from "@piggo-gg/core";

export type World = {
  actionBuffer: StateBuffer<InvokedAction>
  chatHistory: StateBuffer<string>
  clientPlayerId: string | undefined
  commands: Record<string, Command>
  currentGame: Game
  debug: boolean
  entities: Record<string, Entity>
  entitiesAtTick: Record<number, Record<string, SerializedEntity>>
  games: Record<string, GameBuilder>
  isConnected: boolean
  lastTick: DOMHighResTimeStamp
  ms: number
  renderer: Renderer | undefined
  runtimeMode: "client" | "server"
  systems: Record<string, System>
  tick: number
  tickFaster: boolean
  tickFlag: "green" | "red"
  tickrate: number
  addEntities: (entities: Entity[]) => void
  addEntity: (entity: Entity, timeout?: number) => string
  addEntityBuilders: (entityBuilders: (() => Entity)[]) => void
  addSystemBuilders: (systemBuilders: SystemBuilder[]) => void
  addSystems: (systems: System[]) => void
  onTick: (_: { isRollback: boolean }) => void
  removeEntity: (id: string) => void
  removeSystem: (id: string) => void
  setGame: (game: GameBuilder) => void
}

export type WorldBuilder = (_: WorldProps) => World;

export type WorldProps = {
  clientPlayerId?: string | undefined
  commands?: Command[]
  games?: GameBuilder[]
  renderer?: Renderer | undefined
  runtimeMode: "client" | "server"
}

// World manages all runtime state
export const World = ({ clientPlayerId, commands, games, renderer, runtimeMode }: WorldProps): World => {

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
    commands: {},
    currentGame: { id: "", entities: [], systems: [] },
    debug: false,
    entities: {},
    entitiesAtTick: {},
    games: {},
    isConnected: false,
    lastTick: 0,
    ms: 0,
    renderer,
    runtimeMode,
    systems: {},
    tick: 0,
    tickFaster: false,
    tickFlag: "green",
    tickrate: 25,
    addEntity: (entity: Entity, timeout?: number) => {
      const oldEntity = world.entities[entity.id];
      if (oldEntity?.components.renderable) oldEntity.components.renderable.cleanup();
      world.entities[entity.id] = entity;

      if (timeout) setTimeout(() => world.removeEntity(entity.id), timeout);

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
      if (system.data) world.removeEntity(`SystemEntity-${id}`);
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
          const system = systemBuilder.init({ world, renderer: renderer, clientPlayerId: world.clientPlayerId });
          if (system) world.addSystems([system]);
        }
      })
    },
    onTick: ({ isRollback }) => {
      const now = performance.now();

      // check whether it's time to calculate the next tick
      if (!world.tickFaster && !isRollback && ((world.lastTick + world.tickrate) > now)) {
        scheduleOnTick();
        return;
      }

      if (world.tickFlag === "red") {
        console.log("defering tick");
        scheduleOnTick();
        return;
      }

      // update lastTick
      if (!isRollback && !world.tickFaster) {
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
      world.actionBuffer.clearBeforeTick(world.tick - 5);
      Object.keys(world.entitiesAtTick).map(Number).forEach((tick) => {
        if ((world.tick - tick) > 5) {
          delete world.entitiesAtTick[tick];
        }
      });
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

  // schedule tick
  scheduleOnTick();

  // setup games
  if (games) {
    games.forEach((game) => world.games[game.id] = game);
    if (games[0]) world.setGame(games[0]);
  }

  // setup commands
  if (commands) {
    commands.forEach((command) => world.commands[command.id] = command);
  }

  return world;
}
