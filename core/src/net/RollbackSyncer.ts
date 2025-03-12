import {
  ceil, entityConstructors, entries, GameData, keys, stringify, Syncer, values, World
} from "@piggo-gg/core"

// TODO not generic across games (dude/spike)
export const RollbackSyncer = (world: World): Syncer => {

  let lastSeenTick = 0
  let rollback = false

  const mustRollback = (reason: string) => {
    console.log(`MUST ROLLBACK tick:${world.tick}`, reason)
    rollback = true
  }

  // find latest actions for other players' characters
  const handleOtherPlayers = (message: GameData) => {

    if (message.actions[message.tick]) {
      for (const [entityId, actions] of entries(message.actions[message.tick])) {

        if (entityId.startsWith("dude") && entityId !== world.client?.playerCharacter()?.id) {
          for (const action of actions) {
            if (action.actionId !== "spike") {
              world.actions.push(world.tick, entityId, { ...action, offline: true })
            }
          }
          continue
        }
      }
    }

    let latest = 0

    for (const [tick, actions] of entries(message.actions)) {
      if (Number(tick) > latest) {
        for (const entityId of keys(actions)) {
          if (entityId.startsWith("dude") && entityId !== world.client?.playerCharacter()?.id) {
            latest = Number(tick)
          }
        }
      }
    }

    if (latest) {
      for (const [entityId, actions] of entries(message.actions[latest])) {
        if (entityId.startsWith("dude") && entityId !== world.client?.playerCharacter()?.id) {
          for (const action of actions) {
            if (action.actionId === "spike") {
              const pushed = world.actions.push(latest, entityId, { ...action, offline: true })

              if (pushed) {
                mustRollback(`spike world:${world.tick} tick:${latest}`)
              }
            }
          }
        }
      }
    }
  }

  return {
    writeMessage: (world) => ({
      actions: world.actions.fromTick(world.tick),
      chats: world.messages.atTick(world.tick) ?? {},
      game: world.game.id,
      playerId: world.client?.playerId() ?? "",
      serializedEntities: {},
      tick: world.tick,
      timestamp: Date.now(),
      type: "game"
    }),
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

      lastSeenTick = message.tick

      const localActions = world.actions.atTick(message.tick) ?? {}

      handleOtherPlayers(message)

      if (message.actions[message.tick]) {
        for (const [entityId, actions] of entries(message.actions[message.tick])) {

          if (entityId.startsWith("dude") && entityId !== world.client?.playerCharacter()?.id) {
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
        for (const [entityId, serializedEntity] of entries(remote)) {
          if (entityId.startsWith("dude") && entityId !== world.client?.playerCharacter()?.id) {
            continue
          }

          if (local[entityId]) {
            if (JSON.stringify(local[entityId]) !== JSON.stringify(serializedEntity)) {
              mustRollback(`entity: ${entityId} mismatch ${message.tick} ${stringify(local[entityId])} ${stringify(serializedEntity)}`)
              continue
            }
          }
        }
      }

      if (rollback) {

        if (message.game !== world.game.id) {
          world.setGame(world.games[message.game])
        }

        world.tick = message.tick - 1

        // sync entities
        keys(message.serializedEntities).forEach((entityId) => {
          // todo still stutters when other dude hits ball
          if (entityId.startsWith("dude") && entityId !== world.client?.playerCharacter()?.id) {
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

        // find latest actions for other dudes
        handleOtherPlayers(message)

        // set actions
        if (message.actions[message.tick]) {
          entries(message.actions[message.tick]).forEach(([entityId, actions]) => {
            if (entityId.startsWith("dude") && entityId !== world.client?.playerCharacter()?.id) {
              return
            }
            world.actions.set(message.tick, entityId, actions)
          })
        }

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

        keys(message.serializedEntities).forEach((entityId) => {
          if (entityId.startsWith("dude") && entityId !== world.client?.playerCharacter()?.id) {
            world.entities[entityId].deserialize(message.serializedEntities[entityId])
          }
        })

        // set serialized entities
        world.entitiesAtTick[message.tick] = {
          ...message.serializedEntities
        }

        console.log(`rollback msg:${message.tick} forward:${framesForward} end:${world.tick}`)
      }

      rollback = false
    }
  }
}
