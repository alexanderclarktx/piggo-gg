import { entityConstructors, entries, keys, Syncer } from "@piggo-gg/core"

export const RollbackSyncer: Syncer = {
  writeMessage: (world) => {
    return {
      actions: world.actions.atTick(world.tick + 1) ?? {},
      chats: world.messages.atTick(world.tick) ?? {},
      game: world.currentGame.id,
      playerId: world.client?.playerId() ?? "",
      serializedEntities: {},
      tick: world.tick,
      timestamp: Date.now(),
      type: "game"
    }
  },
  handleMessage: (world, message) => {

    let rollback = false

    const mustRollback = (reason: string) => {
      console.log(`MUST ROLLBACK tick:${world.tick}`, reason)
      rollback = true
    }

    // check if actions and entities match what we had at that tick
    const actions = world.actions.atTick(message.tick) ?? {}

    // TODO should filter out other character's actions
    if (JSON.stringify(actions) !== JSON.stringify(message.actions)) {
      console.log("actions mismatch", actions, message.actions)
      rollback = true
      // mustRollback("actions mismatch")
    }

    // compare entity states
    const entities = world.entitiesAtTick[message.tick]
    const serializedEntities = message.serializedEntities

    if (!entities) {
      mustRollback("no entities locally")
    } else if (keys(entities).length !== keys(serializedEntities).length) {
      mustRollback(`entity count mismatch ${keys(entities).length} ${keys(serializedEntities).length}`)
      rollback = true
    }

    if (!rollback) {
      entries(serializedEntities).forEach(([entityId, serializedEntity]) => {
        if (entities[entityId]) {
          if (JSON.stringify(entities[entityId]) !== JSON.stringify(serializedEntity)) {
            console.log("entity mismatch", entities[entityId], serializedEntity)
            rollback = true
            return
          }
        }
      })
    }

    // if (JSON.stringify(entities) !== JSON.stringify(serializedEntities)) {
    //   console.log("entities mismatch", JSON.stringify(entities), JSON.stringify(serializedEntities))
    //   rollback = true
    // mustRollback("entities mismatch")
    // }

    if (rollback) {

      if (message.game !== world.currentGame.id) {
        console.log("game mismatch")
        world.setGame(world.games[message.game])
      }

      world.tick = message.tick - 1

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

      // set entity states
      keys(message.serializedEntities).forEach((entityId) => {
        if (world.entities[entityId]) {
          world.entities[entityId].deserialize(message.serializedEntities[entityId])
        }
      })

      // set actions
      entries(message.actions).forEach(([entityId, actions]) => {
        world.actions.set(message.tick, entityId, actions)
      })

      // roll forward
      console.log("ROLLING BACK", world.client!.lastLatency)
      const framesToRoll = world.client!.lastLatency / world.tickrate + 1
      for (let i = 0; i < framesToRoll; i++) {
        world.onTick({ isRollback: true })
      }
    }
  }
}
