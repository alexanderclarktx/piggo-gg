import { Action, ActionMap, Entity, Position } from "@piggo-gg/core";

export type ZombieMovementActions = "chase";

export const getClosestEntity = (entities: Entity<Position>[], pos: { x: number, y: number }): Entity<Position> => {
  if (entities.length > 1) {
    entities.sort((a: Entity<Position>, b: Entity<Position>) => {
      const aPosition = a.components.position;
      const bPosition = b.components.position;
      const dx = aPosition.data.x - pos.x;
      const dy = aPosition.data.y - pos.y;
      const da = dx * dx + dy * dy;
      const dx2 = bPosition.data.x - pos.x;
      const dy2 = bPosition.data.y - pos.y;
      const db = dx2 * dx2 + dy2 * dy2;
      return da - db;
    });
  }
  return entities[0];
}

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
