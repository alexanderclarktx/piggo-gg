import { Networked, Player, TickData, World, WorldBuilder } from "@piggo-legends/core";
import { PerClientData, WsServerSystem } from "@piggo-legends/server";
import { ServerWebSocket } from "bun";

export type ServerWorld = {
  world: World
  clients: Record<string, ServerWebSocket<unknown>>
  handleMessage: (ws: ServerWebSocket<PerClientData>, msg: string) => void
  handleClose: (ws: ServerWebSocket<PerClientData>) => void
}

export type ServerWorldProps = {
  worldBuilder: WorldBuilder
  clients: Record<string, ServerWebSocket<unknown>>
}

export const ServerWorld = ({ worldBuilder, clients }: ServerWorldProps ): ServerWorld => {

  const world = worldBuilder({ runtimeMode: "server" })

  world.addSystems([WsServerSystem({ world, clients })]);

  const handleMessage = (ws: ServerWebSocket<PerClientData>, msg: string) => {
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
      Object.keys(parsedMessage.commands).forEach((frameNumber) => {
        const frame = Number(frameNumber);

        if (!world.localCommandBuffer[frame]) world.localCommandBuffer[frame] = {};

        Object.keys(parsedMessage.commands[frame]).forEach((entityId) => {
          const command = parsedMessage.commands[frame][entityId];
          world.localCommandBuffer[frame][entityId] = command;
        });
      });
    }
  }

  const handleClose = (ws: ServerWebSocket<PerClientData>) => {

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
