import { Action, Controlling, Entity } from "@piggo-gg/core";

export const PlayerControlsEntity: Action = Action(({ entity, world, player }) => {
  if (!entity || !player) return;

  const playerEntity = world.entities[player] as Entity;
  playerEntity.components.controlling = new Controlling({ entityId: entity.id });
})
