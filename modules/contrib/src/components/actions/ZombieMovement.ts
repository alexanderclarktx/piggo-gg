import { ActionMap, Character, Controlling, Position, Renderable } from "@piggo-legends/contrib";
import { Entity, Game } from "@piggo-legends/core";

const speed = 1.2;
const tau = Math.PI * 2

export type ZombieMovementCommands = "chase"

export const ZombieMovement: ActionMap<ZombieMovementCommands> = {
  "chase": (entity: Entity, game: Game) => {
    const { position } = entity.components as { position: Position };

    // get the player entity's position
    const player = game.entities[game.thisPlayerId] as Entity & { components: { controlling: Controlling } };
    const playerControlledEntity = game.entities[player.components.controlling.entityId];
    const pp = playerControlledEntity.components.position as Position;

    // delta toward player
    let dx = pp.x - position.x;
    let dy = pp.y - position.y;

    // normalize speed toward player
    let moveX = dx / Math.sqrt(dx * dx + dy * dy) * speed;
    let moveY = dy / Math.sqrt(dx * dx + dy * dy) * speed;

    // move
    position.x += moveX;
    position.y += moveY;

    // get angle of movement
    const angle = Math.atan2(moveY, moveX) + 3.14;

    // set animation based on angle
    const character = (entity.components.renderable as Renderable).r as Character;
    if (character) {
      if      (angle >= 15/16 * tau && angle < 16/16 * tau) character.setAnimation("ul");
      else if (angle >= 0 && angle < 1/16 * tau)            character.setAnimation("ul");
      else if (angle >= 1/16 * tau && angle < 3/16 * tau)   character.setAnimation("u");
      else if (angle >= 3/16 * tau && angle < 5/16 * tau)   character.setAnimation("ur");
      else if (angle >= 5/16 * tau && angle < 7/16 * tau)   character.setAnimation("r");
      else if (angle >= 7/16 * tau && angle < 9/16 * tau)   character.setAnimation("dr");
      else if (angle >= 9/16 * tau && angle < 11/16 * tau)  character.setAnimation("d");
      else if (angle >= 11/16 * tau && angle < 13/16 * tau) character.setAnimation("dl");
      else if (angle >= 13/16 * tau && angle < 15/16 * tau) character.setAnimation("l");
    }
  }
}
