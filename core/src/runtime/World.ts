import {
  BlockData, Character, Client, Command, ComponentTypes, D3Renderer,
  Data, Entity, Game, GameBuilder, InvokedAction, Networked, Player,
  Random, Renderer, SerializedEntity, System, SystemBuilder, SystemEntity,
  TickBuffer, ValidComponents, XY, XYZ, keys, logPerf, values
} from "@piggo-gg/core"
import { World as RapierWorld } from "@dimforge/rapier2d-compat"

export type World = {
  actions: TickBuffer<InvokedAction>
  blocks: BlockData
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
  physics: RapierWorld | undefined
  random: Random
  renderer: Renderer | undefined
  systems: Record<string, System>
  three: D3Renderer | undefined
  tick: number
  tickFlag: "green" | "red"
  tickrate: number
  tileMap: number[] | undefined // deprecated
  time: DOMHighResTimeStamp
  trees: XYZ[]
  addEntities: (entities: Entity[]) => void
  addEntity: (entity: Entity, timeout?: number) => string | undefined
  addEntityBuilders: (entityBuilders: (() => Entity)[]) => void
  addSystemBuilders: (systemBuilders: SystemBuilder[]) => void
  addSystems: (systems: System[]) => void
  announce: (message: string) => void
  characters: () => Character[]
  entity: <T extends ComponentTypes>(id: string) => Entity<T> | undefined
  flip: (xy: XY) => XY
  flipped: () => 1 | -1
  onTick: (_: { isRollback: boolean }) => void
  onRender: () => void
  players: () => Player[]
  queryEntities: <T extends ComponentTypes>(query: ValidComponents[], filter?: (entity: Entity<T>) => boolean) => Entity<T>[]
  removeEntity: (id: string) => void
  removeSystem: (id: string) => void
  setGame: (game: GameBuilder | string) => void
}

export type WorldBuilder = (_: WorldProps) => World

export type WorldProps = {
  commands?: Command[]
  games?: GameBuilder[]
  systems?: SystemBuilder[]
  three?: D3Renderer
  renderer?: Renderer | undefined
  mode?: "client" | "server"
}

// World manages all runtime state
export const World = ({ commands, games, systems, renderer, mode, three }: WorldProps): World => {

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
    blocks: BlockData(),
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
    physics: undefined,
    random: Random(123456111),
    renderer,
    systems: {},
    three,
    tick: 0,
    tickFlag: "green",
    tickrate: 25,
    tileMap: undefined,
    time: performance.now(),
    trees: [],
    addEntity: (entity: Entity) => {
      const oldEntity = world.entities[entity.id]
      if (oldEntity?.components.renderable) {
        oldEntity.removed = true
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
    characters: () => {
      return world.players().map(p => p.components.controlling?.getCharacter(world)).filter(Boolean) as Character[]
    },
    removeEntity: (id: string) => {
      const entity = world.entities[id]
      if (entity) {
        delete world.entities[id]
        entity.components.renderable?.cleanup()

        entity.removed = true
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
    flip: ({ x, y }: XY) => {
      const angle = world.renderer?.camera.angle ?? 0
      if (angle === 0) return { x, y }

      // translate relative to center
      const a = angle * Math.PI / 2
      const c = Math.cos(a)
      const s = Math.sin(a)

      const rx = (x * c - y * s)
      const ry = (x * s + y * c)

      return { x: rx, y: ry }
    },
    flipped: () => {
      return (world.renderer?.camera.angle ?? 0) === 0 ? 1 : -1
    },
    onTick: ({ isRollback }) => {
      const now = performance.now()

      if (world.tick > 120 && world.players().length === 0) return

      // check if it's time to run the next tick
      if (!isRollback && ((world.lastTick + world.tickrate) > now)) {
        scheduleOnTick()
        return
      }

      // update lastTick
      if (!isRollback) {
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
      world.time = now

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

          const now = performance.now()
          system.onTick?.(filterEntities(system.query, values(world.entities)), isRollback)
          logPerf(system.id, now)
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
    onRender: () => {
      if (world.renderer || world.three) {
        const now = performance.now()
        values(world.systems).forEach((system) => {
          system.onRender?.(filterEntities(system.query, values(world.entities)), now - world.time)
        })
      }
    },
    players: () => {
      return world.queryEntities(["pc"]) as Player[]
    },
    queryEntities: <T extends ComponentTypes>(query: ValidComponents[], filter: (entity: Entity<T>) => boolean = () => true) => {
      const entities = filterEntities(query, values(world.entities)) as Entity<T>[]
      return entities.filter(filter) // .sort((a, b) => a.id.localeCompare(b.id))
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

      // reset physics
      if (world.physics) {
        world.physics.free()
        world.physics = new RapierWorld({ x: 0, y: 0 })
      }

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

      if (world.renderer) {
        world.renderer.camera.scaleTo(2.5)
        world.renderer.setBgColor(bgColor || 0x000000)
      }

      // add new entities
      for (const entity of entities) {
        if (entity.persists && world.entity(entity.id)) continue
        world.addEntity(entity)
      }

      world.addSystemBuilders(systems)

      commands?.forEach((command) => world.commands[command.id] = command)
    }
  }

  // set up physics
  // RapierInit().then(() => world.physics = new RapierWorld({ x: 0, y: 0 }))

  // set up client
  if (world.mode === "client") world.client = Client({ world })

  // schedule onTick
  scheduleOnTick()

  // schedule onRender
  if (renderer) {
    renderer.app.ticker.add(() => {
      const now = performance.now()
      values(world.systems).forEach((system) => {
        system.onRender?.(filterEntities(system.query, values(world.entities)), now - world.time)
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
