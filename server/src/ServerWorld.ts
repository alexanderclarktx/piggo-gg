import { DefaultWorld, keys, NetMessageTypes, NetServerSystem, Player, World } from "@piggo-gg/core"
import { games } from "@piggo-gg/games"
import { PerClientData, NoobSystem } from "@piggo-gg/server"
import { ServerWebSocket } from "bun"

export type WS = ServerWebSocket<PerClientData>

export type ServerWorld = {
  world: World
  clients: Record<string, WS>
  getNumClients: () => number
  handleMessage: (ws: WS, msg: NetMessageTypes) => void
  handleClose: (ws: WS) => void
}

export type ServerWorldProps = {
  clients?: Record<string, WS>
}

export const ServerWorld = ({ clients = {} }: ServerWorldProps = {}): ServerWorld => {

  const world = DefaultWorld({ mode: "server", games })
  const latestClientMessages: Record<string, { td: NetMessageTypes, latency: number }[]> = {}

  world.addSystems([NetServerSystem({ world, clients, latestClientMessages })])
  world.addSystemBuilders([NoobSystem])

  return {
    world,
    clients,
    getNumClients: () => keys(clients).length,
    handleClose: (ws: WS) => {
      const player = world.entity(ws.data.playerId)
      if (player) {
        const character = player.components.controlling?.getCharacter(world)
        if (character) {
          console.log(`removing character ${character.id}`)
          world.removeEntity(character.id)
        }
        world.removeEntity(player.id)
      }

      delete clients[ws.remoteAddress]
      delete latestClientMessages[ws.data.playerName!]

      console.log(`${ws.data.playerName} disconnected`)
    },
    handleMessage: (ws: WS, msg: NetMessageTypes) => {
      if (msg.type !== "game") return

      // add player entity if it doesn't exist
      if (!world.entities[msg.playerId]) {
        ws.data.playerId = msg.playerId

        world.addEntity(Player({ id: msg.playerId, name: ws.data.playerName }))

        clients[msg.playerId] = ws
        latestClientMessages[msg.playerId] = []

        console.log(`${ws.data.playerName} connected ${ws.remoteAddress}`)
      }

      // store last message for client
      latestClientMessages[msg.playerId].push({
        td: msg,
        latency: Date.now() - msg.timestamp
      })

      if (world.tick % 400 === 0) console.log(`world:${world.tick} msg:${msg.tick} diff:${msg.tick - world.tick}`)
    }
  }
}
