import { Action, Controlled, Controlling, Position } from "@piggo-legends/contrib";
import { Entity, EntityProps, Game, GameProps } from "@piggo-legends/core";

export const playerControlsEntity: Action = (entity: Entity<EntityProps>, game: Game<GameProps>, player: string) => {
  // check that the entity isn't already being controlled
  if (entity.components.controlled) return;

  // get the player entity
  const playerEntity = game.props.entities[player] as Entity<EntityProps>;

  // release control if already controlling another entity
  if (playerEntity.components.controlling) {
    const previouslyControlling = playerEntity.components.controlling as Controlling;
    const controlledEntity = game.props.entities[previouslyControlling.entityId] as Entity<EntityProps>;
    delete controlledEntity.components.controlled;
  }

  // give the player control of the entity
  playerEntity.components.controlling = new Controlling({ entityId: entity.id });
  entity.components.controlled = new Controlled({ entityId: playerEntity.id });

  // track the entity with the camera
  game.props.renderer.trackCamera(entity.components.position as Position);
}
