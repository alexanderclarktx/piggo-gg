import { Action, Controlling, Entity, InvokedAction, Player } from "@piggo-gg/core";

export const controlEntity: Action = Action(({ entity, player }) => {
  if (!entity || !player) return;

  player.components.controlling = new Controlling({ entityId: entity.id });
})

export const spawnSkellyForNoob = (player: Entity<Player>): InvokedAction => ({
  action: "spawnSkelly",
  playerId: player.id,
  params: {}
})
