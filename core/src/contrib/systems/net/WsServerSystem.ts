import { System, TickData, World } from "@piggo-gg/core";

export type ServerNetcodeSystemProps = {
  world: World
  clients: Record<string, { send: (_: string) => number }>
  latestClientMessages: Record<string, { td: TickData, latency: number }>
}

export const WsServerSystem = ({ world, clients, latestClientMessages }: ServerNetcodeSystemProps): System => {

  const onTick = () => {

    // prepare actions & messages for this tick + future ticks
    const frames = world.actionBuffer.keys().filter((tick) => tick >= world.tick).reverse();

    let actions: Record<number, Record<string, string[]>> = {};
    let chats: Record<number, Record<string, string[]>> = {};

    // populate the first 15 ticks empty
    // for (let i = 0; i < 15; i++) actions[world.tick + i] = {}

    // const latestActionForEntity: Record<string, [number, string[]]> = {};

    frames.forEach((tick) => {
      const actionsAtTick = world.actionBuffer.atTick(tick);
      if (actionsAtTick && Object.keys(actionsAtTick).length) {
        actions[tick] = actionsAtTick;
      }

      const messagesAtTick = world.chatHistory.atTick(tick);
      if (messagesAtTick && Object.keys(messagesAtTick).length) {
        chats[tick] = messagesAtTick;
      }
    });

    // build tick data
    const tickData: TickData = {
      type: "game",
      player: "server",
      tick: world.tick,
      timestamp: Date.now(),
      serializedEntities: world.entitiesAtTick[world.tick],
      actions,
      chats
    };

    // send tick data to all clients
    Object.entries(clients).forEach(([id, client]) => {

      // const actionsAppend: Record<number, Record<string, string[]>> = {};

      // // predict other players' actions
      // Object.entries(latestActionForEntity).forEach(([entityId, tickActions]) => {

      //   const [ tick, latestActions ] = tickActions;
      //   const shouldAppendEmpty = latestClientMessages[entityId.split("-")[1]]?.td.tick > tick;

      //   // skip for the client's own entity (TODO hacky)
      //   if (entityId !== `skelly-${id}`) { // latestActions.length && 
      //     const futureTicks = Object.keys(actions).map(Number).filter((t) => t > tick);
      //     futureTicks.forEach((futureTick) => {
      //       if (!actionsAppend[futureTick]) actionsAppend[futureTick] = {};

      //       if (shouldAppendEmpty) {
      //         actionsAppend[futureTick][entityId] = [];
      //       } else {
      //         actionsAppend[futureTick][entityId] = [...latestActions];
      //       }
      //     });
      //   }
      // });

      client.send(JSON.stringify({
        ...tickData,
        actions,
        latency: latestClientMessages[id]?.latency,
      }));
    })
  }

  return {
    id: "WsServerSystem",
    onTick
  }
}
