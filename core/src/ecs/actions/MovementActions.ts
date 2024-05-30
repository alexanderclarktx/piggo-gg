import { Action, Entity, Noob, Position, XY, closestEntity } from "@piggo-gg/core";

export const Head = Action<XY>(({ params, entity }) => {
  if (!entity) return;

  const { position } = entity.components;

  position?.setHeading({ x: params.x, y: params.y });
});

export const Move = Action<XY>(({ params, entity }) => {
  if (!entity) return;

  const { position } = entity.components;

  position?.setHeading({ x: NaN, y: NaN });
  position?.setVelocity({ x: params.x, y: params.y });
});

export const Chase = Action(({ world, entity }) => {
  if (!entity) return;

  const { position } = entity.components;
  if (!position) return;

  const players = world.queryEntities(["player"]) as Noob[];
    let playerControlledEntities: Entity<Position>[] = [];
    players.forEach((player) => {
      const controlledEntities = world.entities[player.components.controlling.data.entityId] as Entity<Position>;
      if (controlledEntities) playerControlledEntities.push(controlledEntities);
    });

    // find the closest player entity position
    const closest = closestEntity(playerControlledEntities, position.data);
    if (!closest) return;

    position.setHeading(closest.components.position.data);
});
