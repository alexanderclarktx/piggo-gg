import { Ball, GameData, LineWall, Noob, Projectile, SerializedEntity, Syncer, World, Zombie } from "@piggo-gg/core";

export const DelaySyncer: Syncer = {
  writeMessage: (world: World) => {

    const message: GameData = {
      actions: world.actionBuffer.atTick(world.tick + 1) ?? {},
      chats: world.chatHistory.atTick(world.tick) ?? {},
      game: world.currentGame.id,
      player: world.client?.playerId ?? "",
      serializedEntities: {},
      tick: world.tick,
      timestamp: Date.now(),
      type: "game"
    }

    world.actionBuffer.clearTick(world.tick + 1);
    return message;
  },
  handleMessage: (world: World, message: GameData) => {

    // remove old local entities
    Object.keys(world.entities).forEach((entityId) => {
      if (world.entities[entityId]?.components.networked) {

        if (!message.serializedEntities[entityId]) {
          console.log("DELETE ENTITY", entityId);
          world.removeEntity(entityId);
        }
      }
    });

    // TODO refactor use a table of entities
    // add new entities if not present locally
    Object.keys(message.serializedEntities).forEach((entityId) => {
      if (!world.entities[entityId]) {
        if (entityId.startsWith("zombie")) {
          world.addEntity(Zombie({ id: entityId }));
        } else if (entityId.startsWith("ball")) {
          world.addEntity(Ball({ id: entityId }));
        } else if (entityId.startsWith("noob")) {
          world.addEntity(Noob({ id: entityId }))
        } else if (entityId.startsWith("projectile")) {
          world.addEntity(Projectile({ id: entityId, radius: 3 }));
        } else if (entityId.startsWith("linewall")) {
          const points = entityId.split("-").slice(1).map((p) => parseInt(p)).filter(Number);
          world.addEntity(LineWall({ id: entityId, points, visible: true }));
        } else {
          console.error("UNKNOWN ENTITY ON SERVER", entityId);
        }
      }
    });

    let rollback = false;

    const mustRollback = (reason: string) => {
      console.log("MUST ROLLBACK", reason);
      rollback = true;
    }

    if ((message.tick - 1) !== world.tick) mustRollback(`old tick world=${world.tick} msg=${message.tick}`);

    const localEntities: Record<string, SerializedEntity> = {}
    for (const entityId in world.entities) {
      if (world.entities[entityId].components.networked) {
        localEntities[entityId] = world.entities[entityId].serialize();
      }
    }

    // compare entity counts
    if (!rollback) {
      if (Object.keys(localEntities).length !== Object.keys(message.serializedEntities).length) {
        mustRollback(`entity count local:${Object.keys(localEntities).length} remote:${Object.keys(message.serializedEntities).length}`);
      }
    }

    // compare entity states
    if (!rollback) {
      Object.entries(message.serializedEntities).forEach(([entityId, msgEntity]) => {
        const localEntity = localEntities[entityId];
        if (localEntity) {
          if (entityId.startsWith("skelly") && entityId !== `skelly-${world.client?.playerId}`) return;
          if (JSON.stringify(localEntity) !== JSON.stringify(msgEntity)) {
            mustRollback(`entity state ${entityId} local:${JSON.stringify(localEntity)}\nremote:${JSON.stringify(msgEntity)}`);
          }
        } else {
          mustRollback(`no buffered message ${localEntities.serializedEntities}`);
        }
      });
    }

    if (rollback) {
      world.tick = message.tick - 1;

      if (message.game && message.game !== world.currentGame.id) {
        world.setGame(world.games[message.game]);
      }

      Object.keys(message.serializedEntities).forEach((entityId) => {
        if (world.entities[entityId]) {
          world.entities[entityId].deserialize(message.serializedEntities[entityId]);
        }
      });
    }

    // set actions
    Object.entries(message.actions).forEach(([entityId, actions]) => {
      world.actionBuffer.set(message.tick, entityId, actions);
    });

    // handle new chat messages
    const numChats = Object.keys(message.chats).length;
    if (numChats) {
      Object.entries(message.chats).forEach(([playerId, messages]) => {
        if (playerId === world.client?.playerId) return;
        world.chatHistory.set(world.tick, playerId, messages);
      });
    }
  }
}
