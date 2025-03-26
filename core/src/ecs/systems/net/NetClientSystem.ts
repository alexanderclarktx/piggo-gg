import {
  DelaySyncer, GameData, RollbackSyncer, SystemBuilder, entries, keys, stringify
} from "@piggo-gg/core"
import { decode, encode } from "@msgpack/msgpack"

export const NetClientWriteSystem = SystemBuilder({
  id: "NetClientWriteSystem",
  init: (world) => {

    const { client } = world
    if (!client) return undefined

    const syncer = () => ({
      delay: DelaySyncer(),
      rollback: RollbackSyncer(world)
    }[world.game.netcode])

    return {
      id: "NetClientWriteSystem",
      priority: 20,
      query: [],
      skipOnRollback: true,
      onTick: () => {
        if (client.ws.readyState === WebSocket.OPEN) {
          try {
            const message = syncer().write(world)
            client.ws.send(encode(message))
            // if (keys(message.actions[world.tick + 1]).length > 0) console.log("sent actions", message.actions)
          }
          catch (e) {
            console.error("NetcodeSystem: error sending message")
          }
        }
      }
    }
  }
})

export const NetClientReadSystem = SystemBuilder({
  id: "NetClientReadSystem",
  init: (world) => {
    if (!world.client) return undefined

    const { client, tick } = world

    let buffer: GameData[] = []

    const syncer = () => ({
      delay: DelaySyncer(),
      rollback: RollbackSyncer(world)
    }[world.game.netcode])

    world.actions.clearBeforeTick(tick + 2)

    client.ws.onmessage = (event) => {
      try {
        const message = decode(new Uint8Array(event.data)) as GameData
        if (!message.type || message.type !== "game") return

        // skip old messages
        if (message.tick < client.lastMessageTick) {
          console.error("NetcodeSystem: skipping old message")
          return
        }

        // store latest message
        buffer.push(message)
        client.lastMessageTick = message.tick

        // record latency
        const skew = Date.now() - message.timestamp
        if (message.latency) client.ms = skew + message.latency

        if (world.tick % 100 === 0) {
          // console.log(`skew:${skew} ms:${client.ms} diff:${message.diff} buffer:${buffer.length}`)
        }

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
      id: "NetClientReadSystem",
      query: [],
      priority: 1,
      skipOnRollback: true,
      onTick: () => {

        // hard reset if very behind
        if (buffer.length > 10) {
          buffer = []
          return
        }

        // handle oldest message in buffer
        if (buffer.length > 0) {
          syncer().read({ world, buffer })
        } else {
          world.tickFlag = "red"
        }
      }
    }
  }
})
