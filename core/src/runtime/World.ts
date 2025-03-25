import {
  Client, Command, Entity, Game, GameBuilder, InvokedAction, Renderer, SerializedEntity,
  values, TickBuffer, System, SystemBuilder, SystemEntity, keys, ValidComponents,
  Random, ComponentTypes, Data, Networked
} from "@piggo-gg/core"

export type World = {
  actions: TickBuffer<InvokedAction>
  client: Client | undefined
  commands: Record<string, Command>
  debug: boolean
  entities: Record<string, Entity>
  entitiesAtTick: Record<number, Record<string, SerializedEntity>>
  game: Game
  games: Record<string, GameBuilder>
  lastTick: DOMHighResTimeStamp
  messages: TickBuffer<string>
  mode: "client" | "server"
  random: Random,
  renderer: Renderer | undefined
  systems: Record<string, System>
  tick: number
  tickFaster: boolean
  tickFlag: "green" | "red"
  tickrate: number
  tileMap: number[] | undefined
  addEntities: (entities: Entity[]) => void
  addEntity: (entity: Entity, timeout?: number) => string | undefined
  addEntityBuilders: (entityBuilders: (() => Entity)[]) => void
  addSystemBuilders: (systemBuilders: SystemBuilder[]) => void
  addSystems: (systems: System[]) => void
  announce: (message: string) => void
  entity: <T extends ComponentTypes>(id: string) => Entity<T> | undefined
  queryEntities: <T extends ComponentTypes>(query: ValidComponents[], filter?: (entity: Entity<T>) => boolean) => Entity<T>[]
  onTick: (_: { isRollback: boolean }) => void
  removeEntity: (id: string) => void
  removeSystem: (id: string) => void
  setGame: (game: GameBuilder | string) => void
}

export type WorldBuilder = (_: WorldProps) => World

export type WorldProps = {
  commands?: Command[]
  games?: GameBuilder[]
  systems?: SystemBuilder[]
  renderer?: Renderer | undefined
  mode?: "client" | "server"
}

// World manages all runtime state
export const World = ({ commands, games, systems, renderer, mode }: WorldProps): World => {

  const scheduleOnTick = () => setTimeout(() => world.onTick({ isRollback: false }), 3)

  const filterEntities = (query: ValidComponents[], entities: Entity[]): Entity[] => {
    return entities.filter(e => {
      for (const componentType of query) {
        if (!keys(e.components).includes(componentType)) return false
        if (e.components[componentType]?.active === false) return false
      }
      return true
    })
  }

  const world: World = {
    actions: TickBuffer(),
    messages: TickBuffer(),
    client: undefined,
    commands: {},
    debug: false,
    entities: {},
    entitiesAtTick: {},
    game: { id: "", entities: [], systems: [], netcode: "delay", state: {} },
    games: {},
    lastTick: 0,
    mode: mode ?? "client",
    renderer,
    systems: {},
    tick: 0,
    tickFaster: false,
    tickFlag: "green",
    tickrate: 25,
    tileMap: undefined,
    addEntity: (entity: Entity) => {
      const oldEntity = world.entities[entity.id]
      if (oldEntity?.components.renderable) {
        oldEntity.components.renderable.cleanup()
      }

      world.entities[entity.id] = entity
      return entity.id
    },
    addEntities: (entities: Entity[]) => {
      entities.forEach((entity) => world.addEntity(entity))
    },
    addEntityBuilders: (entityBuilders: (() => Entity)[]) => {
      entityBuilders.forEach((entityBuilder) => world.addEntity(entityBuilder()))
    },
    random: Random(123456789),
    removeEntity: (id: string) => {
      const entity = world.entities[id]
      if (entity) {
        delete world.entities[id]
        entity.components.renderable?.cleanup()
      }
    },
    removeSystem: (id: string) => {
      const system = world.systems[id]
      if (system && system.data) world.removeEntity(`SystemEntity-${id}`)
      if (system) delete world.systems[id]
    },
    addSystems: (systems: System[]) => {
      systems.forEach((system) => {
        if (world.systems[system.id]) {
          console.error(`not inserting duplicate system id ${system.id}`)
          return
        }
        world.systems[system.id] = system
        if (system.data) {
          world.addEntity(SystemEntity({ systemId: system.id, data: system.data }))
        }
      })
    },
    addSystemBuilders: (systemBuilders: SystemBuilder[]) => {
      systemBuilders.forEach((systemBuilder) => {
        if (!world.systems[systemBuilder.id]) {
          const system = systemBuilder.init(world)
          if (system) world.addSystems([system])
        }
      })
    },
    announce: (message: string) => {
      world.messages.push(world.tick + 1, "game", message)
    },
    entity: <T extends ComponentTypes>(id: string) => {
      return world.entities[id] as Entity<T>
    },
    queryEntities: <T extends ComponentTypes>(query: ValidComponents[], filter: (entity: Entity<T>) => boolean = () => true) => {
      const entities = filterEntities(query, values(world.entities)) as Entity<T>[]
      return entities.filter(filter)
    },
    onTick: ({ isRollback }) => {
      const now = performance.now()

      // check whether it's time to calculate the next tick
      if (!world.tickFaster && !isRollback && ((world.lastTick + world.tickrate) > now)) {
        scheduleOnTick()
        return
      }

      if (world.tickFlag === "red") {
        console.log("defer tick")
        // scheduleOnTick()
        // return
      }

      // update lastTick
      if (!isRollback && !world.tickFaster) {
        if ((now - world.tickrate - world.tickrate) > world.lastTick) {
          // catch up (browser was delayed)
          world.lastTick = now
        } else {
          // move forward at fixed timestep
          world.lastTick += world.tickrate
        }
      }

      // increment tick
      world.tick += 1

      // store serialized entities
      world.entitiesAtTick[world.tick] = {}
      for (const entityId in world.entities) {
        if (world.entities[entityId].components.networked) {
          world.entitiesAtTick[world.tick][entityId] = world.entities[entityId].serialize()
        }
      }

      // run system onTick (sorted by priority)
      values(world.systems).sort((a, b) => a.priority - b.priority).forEach((system) => {
        if (!isRollback || (isRollback && !system.skipOnRollback)) {
          if (!world.systems[system.id]) return
          system.onTick?.(filterEntities(system.query, values(world.entities)), isRollback)
        }
      })

      // schedule onTick
      if (!isRollback) scheduleOnTick()

      // clear old buffered data
      world.actions.clearBeforeTick(world.tick - 20)
      keys(world.entitiesAtTick).map(Number).forEach((tick) => {
        if ((world.tick - tick) > 20) {
          delete world.entitiesAtTick[tick]
        }
      })
    },
    setGame: (game: GameBuilder | string) => {
      if (typeof game === "string") game = world.games[game]
      if (!game) return

      // remove old entities
      values(world.entities).forEach((entity) => {
        if (!entity.persists) world.removeEntity(entity.id)
      })

      // remove old systems
      world.game.systems.forEach((system) => world.removeSystem(system.id))

      // set new game
      world.game = game.init(world)

      const gameStateEntity = Entity({
        id: "gameState",
        components: {
          data: Data({ data: world.game.state }),
          networked: Networked()
        }
      })
      world.addEntity(gameStateEntity)

      const { tileMap, bgColor, entities, systems } = world.game

      world.tileMap = tileMap

      world.renderer?.setBgColor(bgColor || 0x000000)

      // initialize new game
      world.addEntities(entities)
      world.addSystemBuilders(systems)
      commands?.forEach((command) => world.commands[command.id] = command)
    }
  }

  // set up client
  if (world.mode === "client") world.client = Client({ world })

  // schedule onTick
  scheduleOnTick()

  // schedule onRender
  if (renderer) {
    renderer.app.ticker.add((ticker) => {
      values(world.systems).forEach((system) => {
        if (system.onRender) system.onRender(filterEntities(system.query, values(world.entities)), ticker.deltaMS)
      })
    })
  }

  if (systems) world.addSystemBuilders(systems)

  // setup games
  if (games) {
    games.forEach((game) => world.games[game.id] = game)
    if (games[0]) world.setGame(games[0])
  }

  // setup commands
  if (commands) {
    commands.forEach((command) => world.commands[command.id] = command)
  }

  return world
}
