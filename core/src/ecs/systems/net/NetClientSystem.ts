import {
  DelaySyncer, Entity, Game, GameData, RollbackSyncer, Syncer, SystemBuilder, entries, keys, stringify
} from "@piggo-gg/core"

export const NetClientSystem = SystemBuilder({
  id: "NetClientSystem",
  init: (world) => {
    if (!world.client) return undefined

    const { client, tick } = world

    let buffer: GameData[] = []

    const syncers: Record<Game["netcode"], Syncer> = {
      delay: DelaySyncer(),
      rollback: RollbackSyncer()
    }
    const syncer = () => syncers[world.currentGame.netcode]

    world.actions.clearBeforeTick(tick + 2)

    client.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as GameData
        if (!message.type || message.type !== "game") return

        // skip old messages
        if (message.tick < client.lastMessageTick) return

        // store latest message
        buffer.push(message)
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
      priority: 1,
      skipOnRollback: true,
      onTick: (_: Entity[]) => {
        const message = syncer().writeMessage(world)

        try {
          if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(stringify(message))
          }
          // if (keys(message.actions).length > 0) console.log("sent actions", message.actions)
        } catch (e) {
          console.error("NetcodeSystem: error sending message", message)
        }

        // hard reset if very behind
        if (buffer.length > 10) {
          buffer = []
          return
        }

        // tick faster if slightly behind
        if (buffer.length > 2) {
          world.tickFaster = true
        } else {
          world.tickFaster = false
        }

        // handle oldest message in buffer
        if (buffer.length > 0) {
          syncer().handleMessages({ world, buffer })
        } else {
          world.tickFlag = "red"
        }
      }
    }
  }
})
