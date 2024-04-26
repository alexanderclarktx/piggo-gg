import { Action, ActionMap, Entity, Position, getClosestEntity } from "@piggo-gg/core";

export type ZombieMovementActions = "chase";

export const ZombieMovement: ActionMap<ZombieMovementActions> = {
  chase: Action(({ entity, world }) => {
    if (!entity) return;

    const { position, renderable } = entity.components;
    if (!position || !renderable) return;

    // get the closest player entity position
    const entities = Object.values(world.entities).filter((e) => e.components.controlled && e.components.position) as Entity<Position>[];
    const closestEntity = getClosestEntity(entities, position.data);
    if (!closestEntity) return;

    position.setHeading(closestEntity.components.position.data);
  })
}
