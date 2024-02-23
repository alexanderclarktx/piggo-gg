import { Networked, Player, TickData, World, WorldBuilder, WsServerSystem } from "@piggo-legends/core";
import { PerClientData } from "@piggo-legends/server";
import { ServerWebSocket } from "bun";

export type WS = ServerWebSocket<PerClientData>

export type ServerWorld = {
  world: World
  clients: Record<string, WS>
  handleMessage: (ws: WS, msg: string) => void
  handleClose: (ws: WS) => void
}

export type ServerWorldProps = {
  worldBuilder: WorldBuilder
  clients: Record<string, WS>
}

export const ServerWorld = ({ worldBuilder, clients }: ServerWorldProps ): ServerWorld => {

  const world = worldBuilder({ runtimeMode: "server" })

  world.addSystems([WsServerSystem({ world, clients })]);

  const handleMessage = (ws: WS, msg: string) => {
    const parsedMessage = JSON.parse(msg) as TickData;

    // add player entity if it doesn't exist
    if (!world.entities[parsedMessage.player]) {
      ws.data.playerName = parsedMessage.player;

      console.log(`${ws.data.playerName} connected ${ws.remoteAddress}`);

      world.addEntity({
        id: parsedMessage.player,
        components: {
          networked: new Networked({ isNetworked: true }),
          player: new Player({ name: parsedMessage.player }),
        }
      });
    }

    if (parsedMessage.commands) {
      Object.keys(parsedMessage.commands).forEach((msgTickString) => {
        const msgTick = Number(msgTickString);

        // ignore messages from the past
        if (msgTick < world.tick) return;

        // create local command buffer for this tick if it doesn't exist
        if (!world.localCommandBuffer[msgTick]) world.localCommandBuffer[msgTick] = {};

        // add commands for the player or entities controlled by the player
        Object.keys(parsedMessage.commands[msgTick]).forEach((entityId) => {
          if (world.entities[entityId]?.components.controlled?.data.entityId === parsedMessage.player) {
            world.localCommandBuffer[msgTick][entityId] = parsedMessage.commands[msgTick][entityId];
          }
        });
      });
    }
  }

  const handleClose = (ws: WS) => {

    // remove player entity
    world.removeEntity(ws.data.playerName!);

    // remove from clients
    delete clients[ws.remoteAddress];

    console.log(`${ws.data.playerName} disconnected`);
  }

  return {
    world,
    clients,
    handleMessage,
    handleClose
  }
}
