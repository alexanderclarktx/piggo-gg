import { Playa, TickData, World, WorldBuilder, WsServerSystem } from "@piggo-legends/core";
import { PerClientData } from "@piggo-legends/server";
import { ServerWebSocket } from "bun";

export type WS = ServerWebSocket<PerClientData>

export type WorldManager = {
  world: World
  clients: Record<string, WS>
  handleMessage: (ws: WS, msg: string) => void
  handleClose: (ws: WS) => void
}

export type WorldManagerProps = {
  worldBuilder: WorldBuilder
  clients: Record<string, WS>
}

export const WorldManager = ({ worldBuilder, clients }: WorldManagerProps ): WorldManager => {

  const world = worldBuilder({ runtimeMode: "server" })

  const clientMessages: Record<string, { td: TickData, localTimestamp: number }> = {};

  world.addSystems([WsServerSystem({ world, clients, clientMessages })]);

  const handleMessage = (ws: WS, msg: string) => {
    const parsedMessage = JSON.parse(msg) as TickData;

    // add player entity if it doesn't exist
    if (!world.entities[parsedMessage.player]) {
      ws.data.playerName = parsedMessage.player;

      clients[parsedMessage.player] = ws;

      console.log(`${ws.data.playerName} connected ${ws.remoteAddress}`);

      world.addEntity(Playa({ id: parsedMessage.player }));
    }

    // ignore messages from the past
    if (clientMessages[ws.remoteAddress] && (parsedMessage.tick < clientMessages[ws.remoteAddress].td.tick)) {
      console.log(`got old:${parsedMessage.tick} vs:${clientMessages[ws.remoteAddress].td.tick} world:${world.tick}`);
      return;
    };

    // store last message for client
    clientMessages[parsedMessage.player] = {
      td: parsedMessage,
      localTimestamp: Date.now()
    }

    // debug log
    const now = Date.now();
    if (world.tick % 50 === 0) console.log(`now:${now} ts:${parsedMessage.timestamp} diff:${now - parsedMessage.timestamp}`);
    if (world.tick % 50 === 0) console.log(`world:${world.tick} msg:${parsedMessage.tick} diff:${world.tick - parsedMessage.tick}`);
    if ((world.tick - parsedMessage.tick) >= 0) console.log(`missed tick${parsedMessage.tick} diff:${world.tick - parsedMessage.tick}`)

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
