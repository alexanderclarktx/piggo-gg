import { Action, ActionMap, Entity, Position } from "@piggo-gg/core";

const speed = 30;
const tau16 = (Math.PI * 2) / 16; // 22.5 degrees

export type ZombieMovementActions = "chase";

export const ZombieMovement: ActionMap<ZombieMovementActions> = {
  chase: Action(({ entity, world }) => {
    if (!entity) return;

    const { position, renderable } = entity.components;
    if (!position || !renderable) return;

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
    const angle = Math.atan2(moveY, moveX) + tau16 * 8;

    // set animation based on angle
    if (angle >= 0 && angle < 1 * tau16) renderable.setAnimation("l");
    else if (angle >= 15 * tau16 && angle < 16 * tau16) renderable.setAnimation("l");
    else if (angle >= 1 * tau16 && angle < 3 * tau16) renderable.setAnimation("ul");
    else if (angle >= 3 * tau16 && angle < 5 * tau16) renderable.setAnimation("u");
    else if (angle >= 5 * tau16 && angle < 7 * tau16) renderable.setAnimation("ur");
    else if (angle >= 7 * tau16 && angle < 9 * tau16) renderable.setAnimation("r");
    else if (angle >= 9 * tau16 && angle < 11 * tau16) renderable.setAnimation("dr");
    else if (angle >= 11 * tau16 && angle < 13 * tau16) renderable.setAnimation("d");
    else if (angle >= 13 * tau16 && angle < 15 * tau16) renderable.setAnimation("dl");
  })
}
