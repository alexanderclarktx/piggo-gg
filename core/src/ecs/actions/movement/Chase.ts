import { Action, Entity, Position } from "@piggo-gg/core";

export const Chase = Action<{ target: Entity<Position> }>(({ entity, params }) => {
  if (!entity) return;

  const { position } = entity.components;
  if (!position) return;

  const { target } = params;

  position.setHeading(target.components.position.data);
});
