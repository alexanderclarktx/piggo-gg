import { System, NetMessageTypes, World, entries, keys, stringify } from "@piggo-gg/core"

export type DelayServerSystemProps = {
  world: World
  clients: Record<string, { send: (_: string) => number }>
  latestClientMessages: Record<string, { td: NetMessageTypes, latency: number }[]>
}

// delay netcode server
export const NetServerSystem = ({ world, clients, latestClientMessages }: DelayServerSystemProps): System => {

  const sendMessage = () => {

    // build tick data
    const tickData: NetMessageTypes = {
      actions: world.actions.atTick(world.tick) ?? {},
      chats: world.messages.atTick(world.tick) ?? {},
      game: world.currentGame.id,
      playerId: "server",
      serializedEntities: world.entitiesAtTick[world.tick] ?? {},
      tick: world.tick,
      timestamp: Date.now(),
      type: "game"
    }

    // send tick data to all clients
    entries(clients).forEach(([id, client]) => {
      client.send(stringify({
        ...tickData,
        latency: latestClientMessages[id]?.at(-1)?.latency,
      }))

      if (world.currentGame.netcode === "delay") {
        if (latestClientMessages[id] && latestClientMessages[id].length > 2) {
          latestClientMessages[id].shift()
          latestClientMessages[id].shift()
        } else {
          latestClientMessages[id]?.shift()
        }
      }
    })
  }

  // process everything
  const handleMessage = () => {
    for (const clientId of keys(latestClientMessages)) {
      const messages = latestClientMessages[clientId]

      for (const message of messages) {
        if (message.td.type !== "game") continue

        const { td } = message

        // process message actions
        if (td.actions) {
          entries(message.td.actions).forEach(([entityId, actions]) => {
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

  // const handleMessage = () => {
  //   keys(latestClientMessages).forEach((client) => {
  //     // if (world.tick % 100 === 0) console.log("messages", latestClientMessages[client].length)

  //     let messages: ({ td: NetMessageTypes, latency: number } | undefined)[]

  //     // if (latestClientMessages[client].length > 2) {
  //     //   messages = [latestClientMessages[client][0], latestClientMessages[client][1]]
  //     // } else {
  //     messages = [latestClientMessages[client][0]]
  //     // }
  //     if (messages.length === 0) return

  //     messages.forEach((message) => {
  //       if (!message) return

  //       const tickData = message.td
  //       if (tickData.type !== "game") return

  //       // process message actions
  //       if (tickData.actions) {
  //         entries(tickData.actions).forEach(([entityId, actions]) => {
  //           actions.forEach((action) => {
  //             world.actions.push(tickData.tick, entityId, action)
  //             console.log(`action ${action.actionId} for ${entityId} at tick ${tickData.tick}`)
  //           })
  //           // if (entityId === "world" || world.entities[entityId]?.components.controlled?.data.entityId === client) {
  //           // tickData.actions[entityId].forEach((action) => {
  //             // world.actions.push(world.tick, entityId, action)
  //           //   world.actions.push(tickData.tick, entityId, action)
  //           // })
  //         })
  //       }

  //       console.log(`client is ${tickData.tick - world.tick} ticks ahead`)

  //       // process message chats
  //       if (tickData.chats[client]) {
  //         world.messages.set(world.tick, client, tickData.chats[client])
  //       }
  //     })
  //   })
  // }

  return {
    id: "NetServerSystem",
    query: [],
    onTick: () => {
      handleMessage()
      sendMessage()
    }
  }
}
