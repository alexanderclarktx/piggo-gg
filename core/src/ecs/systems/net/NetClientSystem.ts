import { Entity, GameData, Syncer, SystemBuilder, entries, keys, stringify } from "@piggo-gg/core"

export const NetClientSystem: (syncer: Syncer) => SystemBuilder<"NetClientSystem"> = (syncer) => ({
  id: "NetClientSystem",
  init: (world) => {
    if (!world.client) return undefined

    let serverMessageBuffer: GameData[] = []

    const { client, tick } = world

    world.actions.clearBeforeTick(tick + 2)

    client.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as GameData
        if (!message.type || message.type !== "game") return

        // skip old messages
        if (message.tick < client.lastMessageTick) return

        // store latest message
        serverMessageBuffer.push(message)
        client.lastMessageTick = message.tick

        // record latency
        client.lastLatency = Date.now() - message.timestamp
        if (message.latency) client.ms = (client.lastLatency + message.latency) / 2

        // set flag to green
        world.tickFlag = "green"

        // handle new chat messages
        if (keys(message.chats).length) {
          entries(message.chats).forEach(([playerId, messages]) => {
            if (playerId === world.client?.playerId()) return
            world.messages.set(world.tick, playerId, messages)
          })
        }
      } catch (e) {
        console.error("NetcodeSystem: error parsing message")
      }
    }

    return {
      id: "NetClientSystem",
      query: ["networked"],
      skipOnRollback: true,
      onTick: (_: Entity[]) => {
        const message = syncer.writeMessage(world)

        try {
          if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(stringify(message))
          }
          // if (keys(message.actions).length > 1) console.log("sent actions", message.actions)
        } catch (e) {
          console.error("NetcodeSystem: error sending message", message)
        }

        // hard reset if very behind
        if (serverMessageBuffer.length > 10) {
          serverMessageBuffer = []
          return
        }

        // tick faster if slightly behind
        if (serverMessageBuffer.length > 2) {
          world.tickFaster = true
        } else {
          world.tickFaster = false
        }

        // handle oldest message in buffer
        if (serverMessageBuffer.length > 0) {
          syncer.handleMessages(world, serverMessageBuffer)
          if (world.currentGame.netcode === "rollback") {
            serverMessageBuffer = []
          }
        } else {
          world.tickFlag = "red"
        }
      }
    }
  }
})
