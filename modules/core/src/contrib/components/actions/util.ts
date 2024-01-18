import { Action, Controlled, Controlling, Entity, Game } from "@piggo-legends/core";

export const playerControlsEntity: Action = (entity: Entity, game: Game, player: string) => {
  // check that the entity isn't already being controlled
  if (entity.components.controlled) return;

  // get the player entity
  const playerEntity = game.entities[player] as Entity;

  // release control if already controlling another entity
  if (playerEntity.components.controlling) {
    const previouslyControlling = playerEntity.components.controlling as Controlling;
    const controlledEntity = game.entities[previouslyControlling.entityId] as Entity;
    delete controlledEntity.components.controlled;
  }

  // give the player control of the entity
  playerEntity.components.controlling = new Controlling({ entityId: entity.id });
  entity.components.controlled = new Controlled({ entityId: playerEntity.id });
}
