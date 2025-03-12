import { ceil, entityConstructors, entries, keys, stringify, Syncer, values } from "@piggo-gg/core"

export const RollbackSyncer = (): Syncer => {

  let lastSeenTick = 0

  return {
    writeMessage: (world) => {

      const actions = { [world.tick]: world.actions.atTick(world.tick) ?? {} }

      return {
        actions,
        chats: world.messages.atTick(world.tick) ?? {},
        game: world.game.id,
        playerId: world.client?.playerId() ?? "",
        serializedEntities: {},
        tick: world.tick,
        timestamp: Date.now(),
        type: "game"
      }
    },
    handleMessages: ({ world, buffer }) => {
      const message = buffer.pop()
      buffer = []

      const start = world.tick

      if (!message) {
        console.error("NO MESSAGE")
        return
      }

      if (message.tick <= lastSeenTick) {
        // console.error("OUT OF ORDER MESSAGE", message.tick, lastSeenTick)
        return
      }

      const gap = world.tick - message.tick
      const framesForward = (gap >= 3 && gap <= 8) ?
        gap :
        ceil(world.client!.ms * 2 / world.tickrate) + 3

      lastSeenTick = message.tick

      let rollback = false

      const mustRollback = (reason: string) => {
        console.log(`MUST ROLLBACK tick:${world.tick}`, reason)
        rollback = true
      }

      // TODO filter out other character's actions
      const localActions = world.actions.atTick(message.tick) ?? {}

      if (message.actions[message.tick]) {

      // for (const [tick, actionsForTick] of entries(message.actions)) {

        
        // for (const [entityId, actions] of entries(actionsForTick)) {

          for (const [entityId, actions] of entries(message.actions[message.tick])) {

          if (entityId.startsWith("dude") && entityId !== world.client?.playerCharacter()?.id) {
            // console.log("action for other dude")
            world.actions.set(world.tick, entityId, actions)
            continue
          }

          if (!localActions[entityId]) {
            mustRollback(`action not found locally ${actions[0].actionId}`)
            break
          }
          if (JSON.stringify(localActions[entityId]) !== JSON.stringify(actions)) {
            mustRollback(`action mismatch ${message.tick} ${entityId} ${stringify(localActions[entityId])} ${stringify(actions)}`)
            break
          }
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

          if (entityId.startsWith("dude") && entityId !== world.client?.playerCharacter()?.id) {
            world.entities[entityId].deserialize(serializedEntity)
            return
          }

          if (local[entityId]) {
            if (JSON.stringify(local[entityId]) !== JSON.stringify(serializedEntity)) {
              mustRollback(`entity: ${entityId} mismatch ${message.tick} ${stringify(local[entityId])} ${stringify(serializedEntity)}`)
              return
            }
          }
        })
      }

      if (rollback) {

        if (message.game !== world.game.id) {
          world.setGame(world.games[message.game])
        }

        world.tick = message.tick - 1

        // sync entities
        keys(message.serializedEntities).forEach((entityId) => {
          if (entityId.startsWith("dude") && entityId !== world.client?.playerCharacter()?.id) {
            // todo still stutters when other dude hits ball
            return
          }
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
        entries(message.actions[message.tick]).forEach(([entityId, actions]) => {
          if (entityId.startsWith("dude") && entityId !== world.client?.playerCharacter()?.id) {
            world.actions.set(world.tick, entityId, actions)
            return
          }
          world.actions.set(message.tick, entityId, actions)
        })

        values(world.systems).forEach((system) => {
          system.onRollback?.()
        })

        // roll forward
        for (let i = 0; i < framesForward; i++) {
          world.onTick({ isRollback: true })
        }

        world.tick += 1

        world.entitiesAtTick[world.tick] = {}
        for (const entityId in world.entities) {
          if (world.entities[entityId].components.networked) {
            world.entitiesAtTick[world.tick][entityId] = world.entities[entityId].serialize()
          }
        }

        // set serialized entities
        world.entitiesAtTick[message.tick] = {
          ...message.serializedEntities
        }

        console.log(`rolling from:${message.tick} forward:${framesForward} end:${world.tick}`)

        // console.log(`start:${start} end:${world.tick}`)
      }
    }
  }
}
