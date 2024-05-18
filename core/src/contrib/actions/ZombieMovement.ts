import { Action, ActionMap, Controlling, Entity, Player, Position, closestEntity } from "@piggo-gg/core";

export type ZombieMovementActions = "chase";

export const ZombieMovement: ActionMap<ZombieMovementActions> = {
  chase: Action(({ entity, world }) => {
    if (!entity) return;

    const { position, renderable } = entity.components;
    if (!position || !renderable) return;

    // get all the player controlled entities
    const players = world.queryEntities(["player"]) as Entity<Player | Controlling>[];
    let playerControlledEntities: Entity<Position>[] = [];
    players.forEach((player) => {
      const controlledEntities = world.entities[player.components.controlling.data.entityId] as Entity<Position>;
      if (controlledEntities) playerControlledEntities.push(controlledEntities);
    });

    // find the closest player entity position
    const closest = closestEntity(playerControlledEntities, position.data);
    if (!closest) return;

    position.setHeading(closest.components.position.data);
  })
}
