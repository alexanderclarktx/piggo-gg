import { ActionMap, Entity, World, Position, Renderable } from "@piggo-legends/core";

const speed = 0.7;
const t = (Math.PI * 2) / 16; // 16th of tau

export type ZombieMovementCommands = "chase"

export const ZombieMovement: ActionMap<ZombieMovementCommands> = {
  "chase": (entity: Entity<Position | Renderable>, world: World) => {
    const { position, renderable } = entity.components;

    // get the closest player entity position
    const entities = Object.values(world.entities).filter((e) => e.components.controlled && e.components.position)
    if (entities.length > 1) {
      entities.sort((a: Entity<Position>, b: Entity<Position>) => {
        const aPosition = a.components.position;
        const bPosition = b.components.position;
        const dx = aPosition.data.x - position.data.x;
        const dy = aPosition.data.y - position.data.y;
        const da = dx * dx + dy * dy;
        const dx2 = bPosition.data.x - position.data.x;
        const dy2 = bPosition.data.y - position.data.y;
        const db = dx2 * dx2 + dy2 * dy2;
        return da - db;
      });
    }
    const closestEntity = entities[0];
    if (!closestEntity) return;

    const playerCharacterPosition = closestEntity.components.position!;

    // delta toward player
    let dx = playerCharacterPosition.data.x - position.data.x;
    let dy = playerCharacterPosition.data.y - position.data.y;

    // normalize speed toward player
    let moveX = dx / Math.sqrt(dx * dx + dy * dy) * speed;
    let moveY = dy / Math.sqrt(dx * dx + dy * dy) * speed;
    position.setVelocity({ x: moveX, y: moveY });

    // get angle of movements
    const angle = Math.atan2(moveY, moveX) + t * 8;

    // set animation based on angle
    if (angle >= 0 && angle < 1 * t) renderable.setAnimation("ul");
    else if (angle >= 15 * t && angle < 16 * t) renderable.setAnimation("ul");
    else if (angle >= 1 * t && angle < 3 * t) renderable.setAnimation("u");
    else if (angle >= 3 * t && angle < 5 * t) renderable.setAnimation("ur");
    else if (angle >= 5 * t && angle < 7 * t) renderable.setAnimation("r");
    else if (angle >= 7 * t && angle < 9 * t) renderable.setAnimation("dr");
    else if (angle >= 9 * t && angle < 11 * t) renderable.setAnimation("d");
    else if (angle >= 11 * t && angle < 13 * t) renderable.setAnimation("dl");
    else if (angle >= 13 * t && angle < 15 * t) renderable.setAnimation("l");
  }
}
