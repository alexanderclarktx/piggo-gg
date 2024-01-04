import { ActionMap, AnimationKeys, Character, Controlling, Position, Renderable } from "@piggo-legends/contrib"
import { Entity, Game } from "@piggo-legends/core";

const speed = 1.2;

export type ZombieMovementCommands = "chase"

export const ZombieMovement: ActionMap<ZombieMovementCommands> = {
  "chase": (entity: Entity, game: Game) => setPosAndAnimation(entity, "d", (position) => {

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
  })
}

const setPosAndAnimation = (entity: Entity, animation: AnimationKeys, move: (position: Position) => void) => {
  const { position, renderable } = entity.components as { position: Position, renderable: Renderable };
  move(position);

  const character = renderable.r as Character;
  if (character) character.setAnimation(animation);
}
