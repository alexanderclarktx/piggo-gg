import {
  ceil, entityConstructors, entries, GameData, keys, stringify, Syncer
} from "@piggo-gg/core"

export const RollbackSyncer: Syncer = {
  writeMessage: (world) => {
    return {
      actions: world.actions.atTick(world.tick) ?? {},
      chats: world.messages.atTick(world.tick) ?? {},
      game: world.currentGame.id,
      playerId: world.client?.playerId() ?? "",
      serializedEntities: {},
      tick: world.tick,
      timestamp: Date.now(),
      type: "game"
    }
  },
  handleMessages: (world, messages) => {
    const message = messages.pop() as GameData

    let rollback = false

    const mustRollback = (reason: string) => {
      console.log(`MUST ROLLBACK tick:${world.tick}`, reason)
      rollback = true
    }

    // check if actions and entities match what we had at that tick
    const actions = world.actions.atTick(message.tick) ?? {}

    // TODO filter out other character's actions
    for (const [entityId, action] of entries(message.actions)) {
      if (!actions[entityId]) {
        mustRollback("action not found locally")
        break
      }
      if (JSON.stringify(actions[entityId]) !== JSON.stringify(action)) {
        mustRollback(`action mismatch ${message.tick} ${entityId} ${stringify(actions[entityId])} ${stringify(action)}`)
        break
      }
    }

    // compare entity states
    const local = world.entitiesAtTick[message.tick]
    const remote = message.serializedEntities

    if (!local) {
      mustRollback("no entities locally")
    } else if (keys(local).length !== keys(remote).length) {
      mustRollback(`entity count mismatch ${keys(local).length} ${keys(remote).length}`)
      rollback = true
    }

    if (!rollback) {
      entries(remote).forEach(([entityId, serializedEntity]) => {
        if (local[entityId]) {
          if (JSON.stringify(local[entityId]) !== JSON.stringify(serializedEntity)) {
            mustRollback(`entity mismatch ${message.tick} ${stringify(local[entityId])} ${stringify(serializedEntity)}`)
            return
          }
        }
      })
    }

    if (rollback) {

      if (message.game !== world.currentGame.id) {
        world.setGame(world.games[message.game])
      }

      world.tick = message.tick - 1

      // sync entities
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
        } else {
          world.entities[entityId].deserialize(message.serializedEntities[entityId])
        }
      })

      // set actions
      entries(message.actions).forEach(([entityId, actions]) => {
        world.actions.set(message.tick, entityId, actions)
      })

      // roll forward
      const frames = ceil(world.client!.lastLatency / world.tickrate + 4)
      for (let i = 0; i < frames; i++) {
        world.onTick({ isRollback: true })
      }
    }
  }
}
