import { ActionMap, Character, Entity, Game, Position, Renderable } from "@piggo-legends/core";

const speed = 0.9;
const t = (Math.PI * 2) / 16; // 16th of tau

export type ZombieMovementCommands = "chase"

export const ZombieMovement: ActionMap<ZombieMovementCommands> = {
  "chase": (entity: Entity<Position | Renderable>, game: Game) => {
    const position = entity.components.position;

    // get the player entity's position
    const playerEntity = game.entities[game.thisPlayerId];
    const playerCharacter = game.entities[playerEntity.components.controlling!.entityId];
    const playerCharacterPosition = playerCharacter.components.position!;

    // delta toward player
    let dx = playerCharacterPosition.x - position.x;
    let dy = playerCharacterPosition.y - position.y;

    // normalize speed toward player
    let moveX = dx / Math.sqrt(dx * dx + dy * dy) * speed;
    let moveY = dy / Math.sqrt(dx * dx + dy * dy) * speed;
    position.setVelocity({ x: moveX, y: moveY });

    // get angle of movements
    const angle = Math.atan2(moveY, moveX) + t * 8;

    // set animation based on angle
    const character = entity.components.renderable.r as Character;
    if (character) {
      if (angle >= 0 && angle < 1 * t) character.setAnimation("ul");
      else if (angle >= 15 * t && angle < 16 * t) character.setAnimation("ul");
      else if (angle >= 1 * t && angle < 3 * t) character.setAnimation("u");
      else if (angle >= 3 * t && angle < 5 * t) character.setAnimation("ur");
      else if (angle >= 5 * t && angle < 7 * t) character.setAnimation("r");
      else if (angle >= 7 * t && angle < 9 * t) character.setAnimation("dr");
      else if (angle >= 9 * t && angle < 11 * t) character.setAnimation("d");
      else if (angle >= 11 * t && angle < 13 * t) character.setAnimation("dl");
      else if (angle >= 13 * t && angle < 15 * t) character.setAnimation("l");
    }
  }
}
