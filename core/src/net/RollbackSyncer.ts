import { ceil, entityConstructors, entries, keys, stringify, Syncer } from "@piggo-gg/core"

export const RollbackSyncer = (): Syncer => {

  let lastSeenTick = 0

  return {
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
    handleMessages: ({ world, buffer }) => {
      const message = buffer.pop()
      buffer = []

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

      console.log(`${world.tick - message.tick} ticks ahead - forward: ${framesForward}`)

      lastSeenTick = message.tick

      let rollback = false

      const mustRollback = (reason: string) => {
        console.log(`MUST ROLLBACK tick:${world.tick}`, reason)
        rollback = true
      }

      // TODO filter out other character's actions
      const actions = world.actions.atTick(message.tick) ?? {}
      for (const [entityId, action] of entries(message.actions)) {

        if (entityId.startsWith("dude") && entityId !== world.client?.playerCharacter()?.id) {
          // console.log("action for other dude")
          world.actions.set(world.tick, entityId, action)
          continue
        }

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

          if (entityId.startsWith("dude") && entityId !== world.client?.playerCharacter()?.id) {
            world.entities[entityId].deserialize(serializedEntity)
            return
          }

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
        for (let i = 0; i < framesForward; i++) {
          world.onTick({ isRollback: true })
        }
      }
    }
  }
}
