import { Action, Controlled, Controlling, Entity, World } from "@piggo-legends/core";

// TODO remove this garbage function. it should be an action
export const playerControlsEntity: Action = {
  validate: () => true,
  apply: (entity: Entity, world: World, player: string) => {
    // check that the entity isn't already being controlled
    if (entity.components.controlled) return;

    // get the player entity
    const playerEntity = world.entities[player] as Entity;

    // release control if already controlling another entity
    if (playerEntity.components.controlling) {
      const previouslyControlling = playerEntity.components.controlling as Controlling;
      const controlledEntity = world.entities[previouslyControlling.data.entityId] as Entity;
      delete controlledEntity.components.controlled;
    }

    // give the player control of the entity
    playerEntity.components.controlling = new Controlling({ entityId: entity.id });
    entity.components.controlled = new Controlled({ entityId: playerEntity.id });
  }
}
