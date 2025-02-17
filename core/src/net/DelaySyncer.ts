import {
  Axe, Ball, Entity, GameData, Hitbox, LineWall, Pickaxe, Piggo, Player,
  Rock, SerializedEntity, Sword, Syncer, Tree, World, Zomi,
  entries, keys, stringify
} from "@piggo-gg/core"

const tableOfEntities: Record<string, (_: { id?: string }) => Entity> = {
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
  "sword": Sword
}

export const DelaySyncer: Syncer = {
  writeMessage: (world: World) => {

    const message: GameData = {
      actions: world.actionBuffer.atTick(world.tick + 1) ?? {},
      chats: world.chatHistory.atTick(world.tick) ?? {},
      game: world.currentGame.id,
      playerId: world.client?.playerId() ?? "",
      serializedEntities: {},
      tick: world.tick,
      timestamp: Date.now(),
      type: "game"
    }

    world.actionBuffer.clearTick(world.tick + 1)
    return message
  },
  handleMessage: (world: World, message: GameData) => {

    // remove old local entities
    keys(world.entities).forEach((entityId) => {
      if (world.entities[entityId]?.components.networked) {

        if (!message.serializedEntities[entityId]) {
          console.log("DELETE ENTITY", entityId)
          world.removeEntity(entityId)
        }
      }
    })

    // TODO refactor use a table of entities
    // add new entities if not present locally
    keys(message.serializedEntities).forEach((entityId) => {
      if (!world.entities[entityId]) {
        const entityKind = entityId.split("-")[0]
        const constructor = tableOfEntities[entityKind]
        if (constructor !== undefined) {
          console.log("ADD ENTITY", entityId)
          world.addEntity(constructor({ id: entityId }))
        } else {
          console.error("UNKNOWN ENTITY ON SERVER", entityId)
        }
      }
    })
          // if (!world.entities[entityId]) {
          //   if (entityId.startsWith("zombie")) {
          //     world.addEntity(Zomi({ id: entityId }))
          //   } else if (entityId.startsWith("ball")) {
          //     world.addEntity(Ball({ id: entityId }))
          //   } else if (entityId.startsWith("player")) {
          //     world.addEntity(Player({ id: entityId }))
          //   } else if (entityId.startsWith("hitbox")) {
          //     world.addEntity(Hitbox({ id: entityId, radius: 3, color: 0xffff00 }))
          //   } else if (entityId.startsWith("linewall")) {
          //     const points = entityId.split("-").slice(1).map((p) => parseInt(p)).filter(Number)
          //     world.addEntity(LineWall({ id: entityId, points, visible: true }))
          //   } else {
          //     console.error("UNKNOWN ENTITY ON SERVER", entityId)
          //   }
          // }
        // })

    let rollback = false

    const mustRollback = (reason: string) => {
      console.log("MUST ROLLBACK", reason)
      rollback = true
    }

    if ((message.tick - 1) !== world.tick) mustRollback(`old tick world=${world.tick} msg=${message.tick}`)

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
      if (numLocal !== numRemote) mustRollback(`entity count local:${numLocal} remote:${numRemote}`)
    }

    // compare entity states
    if (!rollback) {
      entries(message.serializedEntities).forEach(([entityId, msgEntity]) => {
        const localEntity = localEntities[entityId]
        if (localEntity) {
          if (entityId.startsWith("skelly") && entityId !== `skelly-${world.client?.playerId}`) return
          if (stringify(localEntity) !== stringify(msgEntity)) {
            mustRollback(`entity state ${entityId} local:${stringify(localEntity)}\nremote:${stringify(msgEntity)}`)
          }
        } else {
          mustRollback(`no buffered message ${localEntities.serializedEntities}`)
        }
      })
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
      world.actionBuffer.set(message.tick, entityId, actions)
    })

    // handle new chat messages
    const numChats = keys(message.chats).length
    if (numChats) {
      entries(message.chats).forEach(([playerId, messages]) => {
        if (playerId === world.client?.playerId()) return
        world.chatHistory.set(world.tick, playerId, messages)
      })
    }
  }
}
