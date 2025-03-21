import { System, NetMessageTypes, World, entries, keys } from "@piggo-gg/core"
import { encode } from "@msgpack/msgpack"

export type DelayServerSystemProps = {
  world: World
  clients: Record<string, { send: (_: string | Uint8Array, compress?: boolean) => number }>
  latestClientMessages: Record<string, { td: NetMessageTypes, latency: number }[]>
}

// delay netcode server
export const NetServerSystem = ({ world, clients, latestClientMessages }: DelayServerSystemProps): System<"NetServerSystem"> => {

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
        latency: latestClientMessages[id]?.at(-1)?.latency,
      }))
      if (world.tick - 1 !== lastSent) {
        console.error(`sent last:${lastSent} world:${world.tick} to ${id}`)
      }

      if (world.game.netcode === "delay") {
        if (latestClientMessages[id] && latestClientMessages[id].length > 2) {
          latestClientMessages[id].shift()
          latestClientMessages[id].shift()
        } else {
          latestClientMessages[id]?.shift()
        }
      }
    })

    lastSent = world.tick
  }

  const read = () => {
    (world.game.netcode === "delay") ? delay() : rollback()
  }

  const rollback = () => {
    for (const clientId of keys(latestClientMessages)) {
      const messages = latestClientMessages[clientId]

      for (const message of messages) {
        if (message.td.type !== "game") continue

        const { td } = message

        // process message actions
        if (td.actions[td.tick]) {
          entries(td.actions[td.tick]).forEach(([entityId, actions]) => {
            actions.forEach((action) => {
              world.actions.push(td.tick, entityId, action)
            })
          })
        }

        // process message chats
        if (message.td.chats[clientId]) {
          world.messages.set(world.tick, clientId, message.td.chats[clientId])
        }
      }

      latestClientMessages[clientId] = []
    }
  }

  const delay = () => {
    keys(latestClientMessages).forEach((client) => {
      // if (world.tick % 100 === 0) console.log("messages", latestClientMessages[client].length)

      let messages: ({ td: NetMessageTypes, latency: number } | undefined)[]

      if (latestClientMessages[client].length > 2) {
        messages = [latestClientMessages[client][0], latestClientMessages[client][1]]
      } else {
        messages = [latestClientMessages[client][0]]
      }
      if (messages.length === 0) return

      messages.forEach((message) => {
        if (!message) return

        const tickData = message.td
        if (tickData.type !== "game") return

        // process message actions
        if (tickData.actions && tickData.actions[tickData.tick]) {
          entries(tickData.actions[tickData.tick]).forEach(([entityId, actions]) => {
            actions.forEach((action) => {
              world.actions.push(world.tick, entityId, action)
            })
          })
        }

        // process message chats
        if (tickData.chats[client]) {
          world.messages.set(world.tick, client, tickData.chats[client])
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
