import { Entity, GameData, Syncer, SystemBuilder } from "@piggo-gg/core";

// netcode client system
export const NetClientSystem: (syncer: Syncer) => SystemBuilder<"NetClientSystem"> = (syncer) => ({
  id: "NetClientSystem",
  init: ({ world }) => {
    if (!world.client) return undefined;

    const client = world.client;
    let serverMessageBuffer: GameData[] = [];

    world.actionBuffer.clearBeforeTick(world.tick + 2);

    client.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as GameData;
        if (!message.type || message.type !== "game") return;

        // skip old messages
        if (message.tick < client.lastMessageTick) return;

        // store latest message
        serverMessageBuffer.push(message);
        client.lastMessageTick = message.tick;

        // record latency
        client.lastLatency = Date.now() - message.timestamp;
        if (message.latency) client.ms = (client.lastLatency + message.latency) / 2;

        // set flag to green
        world.tickFlag = "green";
      } catch (e) {
        console.error("NetcodeSystem: error parsing message");
      }
    }

    return {
      id: "NetClientSystem",
      query: ["networked"],
      skipOnRollback: true,
      onTick: (_: Entity[]) => {
        const message = syncer.writeMessage(world);
        if (client.ws.readyState === WebSocket.OPEN) client.ws.send(JSON.stringify(message));
  
        // hard reset if very behind
        if (serverMessageBuffer.length > 10) {
          serverMessageBuffer = [];
          return;
        }
  
        // tick faster if slightly behind
        if (serverMessageBuffer.length > 2) {
          world.tickFaster = true;
        } else {
          world.tickFaster = false;
        }
  
        // handle oldest message in buffer
        if (serverMessageBuffer.length > 0) {
          syncer.handleMessage(world, serverMessageBuffer.shift() as GameData);
        }
  
        // set flag to red if no messages
        if (serverMessageBuffer.length === 0) {
          world.tickFlag = "red";
        }
      }
    }
  }
});
