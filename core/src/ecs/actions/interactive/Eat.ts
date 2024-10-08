import { Action, Entity, Position } from "@piggo-gg/core";

export const Eat = Action<{ target: Entity<Position> }>(({ entity, params, world }) => {
  if (!entity) return;

  const { target } = params;
  if (!target || !world.entities[target.id]) return;

  world.removeEntity(target.id);

  if (entity.components.renderable?.scale) {
    entity.components.renderable.scale += 0.5;
  }


  console.log("eating", entity.id)

  const { position } = entity.components;
  if (!position) return;

  position.setHeading(target.components.position.data);
});
