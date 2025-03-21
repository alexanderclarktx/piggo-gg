import {
  ceil, entityConstructors, entries, GameData, keys, stringify, Syncer, values, World
} from "@piggo-gg/core"

// TODO not generic across games (dude/spike)
export const RollbackSyncer = (world: World): Syncer => {

  let last = 0
  let rollback = false

  const mustRollback = (reason: string) => {
    console.log(`MUST ROLLBACK world:${world.tick}`, reason)
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

    for (const [tick, actionSet] of entries(message.actions)) {
      for (const [entityId, actions] of entries(actionSet)) {
        if (entityId.startsWith("dude") && entityId !== world.client?.playerCharacter()?.id) {
          for (const action of actions) {
            if (action.actionId === "spike") {
              const pushed = world.actions.push(Number(tick), entityId, { ...action, offline: true })
              if (pushed) mustRollback(`spike ${tick}`)
            }
          }
        }
      }
    }

    keys(message.serializedEntities).forEach((entityId) => {
      if (entityId.startsWith("dude") && entityId !== world.client?.playerCharacter()?.id) {
        world.entity(entityId)?.deserialize(message.serializedEntities[entityId])
      }
    })
  }

  // pre-read message to consume buffer faster
  const preRead = (message: GameData) => {
    handleOtherPlayers(message)

    if (message.actions[message.tick]) {
      for (const [entityId, actions] of entries(message.actions[message.tick])) {
        if (entityId.startsWith("dude") && entityId !== world.client?.playerCharacter()?.id) {
          continue
        }
        world.actions.set(message.tick, entityId, actions)
      }
    }
  }

  return {
    write: (world) => ({
      actions: world.actions.fromTick(world.tick, s => s.offline !== true),
      chats: world.messages.atTick(world.tick) ?? {},
      game: world.game.id,
      playerId: world.client?.playerId() ?? "",
      serializedEntities: {},
      tick: world.tick + 1,
      timestamp: Date.now(),
      type: "game"
    }),
    read: ({ world, buffer }) => {
      rollback = false

      // get oldest message
      let message = buffer.sort((a, b) => a.tick - b.tick).shift()

      if (!message) {
        console.error("NO MESSAGE")
        return
      }

      // consume buffer
      if (buffer.length > 2) {
        preRead(message)
        message = buffer.shift() as GameData
        console.log("large buffer", buffer.length)
      }

      if (message.tick <= last) {
        console.error(`OUT OF ORDER last:${last} msg:${message.tick} client${world.client?.lastMessageTick}`)
        last = message.tick
        return
      }

      last = message.tick

      const gap = world.tick - message.tick
      const framesForward = (gap >= 2 && gap <= 5) ?
        gap :
        ceil(world.client!.ms / world.tickrate) + 2

      const localActions = world.actions.atTick(message.tick) ?? {}

      handleOtherPlayers(message)

      // check actions
      if (message.actions[message.tick]) {
        for (const [entityId, actions] of entries(message.actions[message.tick])) {

          if (entityId.startsWith("dude") && entityId !== world.client?.playerCharacter()?.id) {
            continue
          }

          if (!localActions[entityId]) {
            mustRollback(`action not found locally ${actions[0].actionId}`)
            break
          }

          // check local has each action
          for (const action of actions) {
            if (localActions[entityId].find((a) => a.actionId === action.actionId) === undefined) {
              mustRollback(`action not found locally ${action.actionId}`)
              break
            }
          }

          // check remote has each action
          for (const action of localActions[entityId]) {
            if (actions.find((a) => a.actionId === action.actionId) === undefined) {
              mustRollback(`action not found remotely ${action.actionId}`)
              break
            }
          }
        }
      }

      // check entity states
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

      // rollback
      if (rollback) {
        const was = world.tick

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

        // rm dangling local entities
        for (const [entityId, entity] of entries(world.entities)) {
          if (entity.components.networked) {
            if (!message.serializedEntities[entityId]) {
              console.log("REMOVE ENTITY", entityId)
              world.removeEntity(entityId)
            }
          }
        }

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

        handleOtherPlayers(message)

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

        console.log(`rollback was:${was} msg:${message.tick} forward:${framesForward} end:${world.tick}`)
      }
    }
  }
}
