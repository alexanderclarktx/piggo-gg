import { System, NetMessageTypes, World, entries, keys, GameData } from "@piggo-gg/core"
import { encode } from "@msgpack/msgpack"

export type DelayServerSystemProps = {
  world: World
  clients: Record<string, { send: (_: string | Uint8Array, compress?: boolean) => number }>
  latestClientMessages: Record<string, GameData[]>
  latestClientLag: Record<string, number>
  latestClientDiff: Record<string, number>
}

// delay netcode server
export const NetServerSystem = ({ world, clients, latestClientMessages, latestClientLag, latestClientDiff }: DelayServerSystemProps): System<"NetServerSystem"> => {

  let lastSent = 0

  const write = () => {

    // build tick data
    const tickData: NetMessageTypes = {
      actions: world.actions.fromTick(world.tick),
      chats: world.messages.atTick(world.tick) ?? {},
      game: world.game.id,
      playerId: "server",
      serializedEntities: world.entitiesAtTick[world.tick] ?? {},
      tick: world.tick,
      timestamp: Date.now(),
      type: "game"
    }

    // send tick data to all clients
    entries(clients).forEach(([id, client]) => {
      client.send(encode({
        ...tickData,
        latency: latestClientLag[id],
        diff: latestClientDiff[id]
      }))
      if (world.tick - 1 !== lastSent) {
        console.error(`sent last:${lastSent} world:${world.tick} to ${id}`)
      }
    })

    lastSent = world.tick
  }

  const read = () => {
    (world.game.netcode === "delay") ? readDelay() : readRollback()
  }

  const readRollback = () => {
    for (const clientId of keys(latestClientMessages)) {
      const messages = latestClientMessages[clientId]

      for (const message of messages) {
        if (message.type !== "game") continue

        // process message actions
        if (message.actions[message.tick]) {
          entries(message.actions[message.tick]).forEach(([entityId, actions]) => {

            actions.forEach((action) => {
              world.actions.push(message.tick, entityId, action)
            })
          })
        }

        // process message chats
        if (message.chats[clientId]) {
          world.messages.set(world.tick, clientId, message.chats[clientId])
        }
      }

      latestClientMessages[clientId] = []
    }
  }

  const readDelay = () => {
    keys(latestClientMessages).forEach((client) => {
      // if (world.tick % 100 === 0) console.log("messages", latestClientMessages[client].length)

      let messages: (GameData | undefined)[]

      if (latestClientMessages[client].length > 2) {
        messages = [latestClientMessages[client][0], latestClientMessages[client][1]]
        latestClientMessages[client].shift()
        latestClientMessages[client].shift()
      } else {
        messages = [latestClientMessages[client][0]]
        latestClientMessages[client].shift()
      }
      if (messages.length === 0) return

      messages.forEach((message) => {
        if (!message) return

        if (message.type !== "game") return

        // process message actions
        if (message.actions && message.actions[message.tick]) {
          entries(message.actions[message.tick]).forEach(([entityId, actions]) => {
            actions.forEach((action) => {
              world.actions.push(world.tick, entityId, action)
            })
          })
        }

        // process message chats
        if (message.chats[client]) {
          world.messages.set(world.tick, client, message.chats[client])
        }
      })
    })
  }

  return {
    id: "NetServerSystem",
    query: [],
    priority: 1,
    onTick: () => {
      read()
      write()
    }
  }
}
