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

  const lastMessageForClient: Record<string, TickData> = {};

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

    // ignore messages from the past
    if (lastMessageForClient[ws.remoteAddress] && (parsedMessage.tick < lastMessageForClient[ws.remoteAddress].tick)) {
      console.log(`got old:${parsedMessage.tick} vs:${lastMessageForClient[ws.remoteAddress].tick} world:${world.tick}`);
      return;
    };

    // store last message for client
    lastMessageForClient[ws.remoteAddress] = parsedMessage;

    // debug log
    const now = Date.now();
    if (world.tick % 50 === 0) console.log(`now:${now} ts:${parsedMessage.timestamp} diff:${now - parsedMessage.timestamp}`);
    if (world.tick % 50 === 0) console.log(`world:${world.tick} msg:${parsedMessage.tick} diff:${world.tick - parsedMessage.tick}`);

    // process message commands
    if (parsedMessage.commands) {
      Object.keys(parsedMessage.commands).forEach((cmdTickString) => {
        const cmdTick = Number(cmdTickString);

        // ignore commands from the past
        if (cmdTick < world.tick) return;

        // create local command buffer for this tick if it doesn't exist
        if (!world.localCommandBuffer[cmdTick]) world.localCommandBuffer[cmdTick] = {};

        // add commands for the player or entities controlled by the player
        Object.keys(parsedMessage.commands[cmdTick]).forEach((entityId) => {
          if (world.entities[entityId]?.components.controlled?.data.entityId === parsedMessage.player) {
            world.localCommandBuffer[cmdTick][entityId] = parsedMessage.commands[cmdTick][entityId];
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
