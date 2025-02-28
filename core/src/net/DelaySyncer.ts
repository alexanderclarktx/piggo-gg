import {
  AK, AWP, Apple, Axe, Ball, Deagle, Entity, GameData, Hitbox, LineWall,
  Pickaxe, Piggo, Player, Rock, SerializedEntity, Sword, Syncer, Tree,
  Zomi, entries, keys, stringify
} from "@piggo-gg/core"

export const entityConstructors: Record<string, (_: { id?: string }) => Entity> = {
  "zomi": Zomi,
  "ball": Ball,
  "player": Player,
  "hitbox": Hitbox,
  "linewall": LineWall,
  "rock": Rock,
  "tree": Tree,
  "piggo": Piggo,
  "axe": Axe,
  "pickaxe": Pickaxe,
  "sword": Sword,
  "apple": Apple,
  "ak": AK,
  "deagle": Deagle,
  "awp": AWP
}

export const DelaySyncer: Syncer = {
  writeMessage: (world) => {

    const message: GameData = {
      actions: world.actions.atTick(world.tick + 1) ?? {},
      chats: world.messages.atTick(world.tick) ?? {},
      game: world.currentGame.id,
      playerId: world.client?.playerId() ?? "",
      serializedEntities: {},
      tick: world.tick,
      timestamp: Date.now(),
      type: "game"
    }

    world.actions.clearTick(world.tick + 1)
    return message
  },
  handleMessages: (world, messages) => {

    const message = messages.shift() as GameData

    // remove old local entities
    keys(world.entities).forEach((entityId) => {
      if (world.entities[entityId]?.components.networked) {

        if (!message.serializedEntities[entityId]) {
          console.log("DELETE ENTITY", entityId)
          world.removeEntity(entityId)
        }
      }
    })

    // add new entities from remote
    keys(message.serializedEntities).forEach((entityId) => {
      if (!world.entities[entityId]) {
        const entityKind = entityId.split("-")[0]
        const constructor = entityConstructors[entityKind]
        if (constructor !== undefined) {
          console.log("ADD ENTITY", entityId)
          world.addEntity(constructor({ id: entityId }))
        } else {
          console.error("UNKNOWN ENTITY ON SERVER", entityId)
        }
      }
    })

    let rollback = false

    const mustRollback = (reason: string, additional?: object, additional2?: object) => {
      console.log(`MUST ROLLBACK tick:${world.tick}`, reason, additional, additional2)
      rollback = true
    }

    if ((message.tick - 1) !== world.tick) {
      mustRollback(`old tick msg:${message.tick}`)
    }

    const localEntities: Record<string, SerializedEntity> = {}
    for (const entityId in world.entities) {
      if (world.entities[entityId].components.networked) {
        localEntities[entityId] = world.entities[entityId].serialize()
      }
    }

    // compare entity counts
    if (!rollback) {
      const numLocal = keys(localEntities).length
      const numRemote = keys(message.serializedEntities).length
      if (numLocal !== numRemote) mustRollback(`entity count local:${numLocal} remote:${numRemote} remote:${message.tick}`)
    }

    // compare entity states
    if (!rollback) {
      for (const [entityId, msgEntity] of entries(message.serializedEntities)) {
        const localEntity = localEntities[entityId]
        if (localEntity) {
          if (stringify(localEntity) !== stringify(msgEntity)) {
            mustRollback(`entity state ${entityId}`, localEntity, msgEntity)
            break
          }
        } else {
          mustRollback(`no buffered message ${localEntities.serializedEntities}`)
        }
      }
    }

    if (rollback) {
      world.tick = message.tick - 1

      if (message.game && message.game !== world.currentGame.id) {
        world.setGame(world.games[message.game])
      }

      keys(message.serializedEntities).forEach((entityId) => {
        if (world.entities[entityId]) {
          world.entities[entityId].deserialize(message.serializedEntities[entityId])
        }
      })
    }

    // set actions
    entries(message.actions).forEach(([entityId, actions]) => {
      world.actions.set(message.tick, entityId, actions)
    })
  }
}
