import { ActionMap, Character, Controlling, Position, Renderable } from "@piggo-legends/contrib";
import { Entity, Game } from "@piggo-legends/core";

const speed = 1.2;
const t = (Math.PI * 2) / 16; // 16th of tau

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

    // get angle of movements
    const angle = Math.atan2(moveY, moveX) + t * 8;

    // set animation based on angle
    const character = (entity.components.renderable as Renderable).r as Character;
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
