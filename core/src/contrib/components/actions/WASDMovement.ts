import { ActionMap, Entity, Position, ValidAction, currentJoystickPosition } from "@piggo-gg/core";

const speed = 140;
const speedDiagonal = speed / Math.sqrt(2);
const speedHorizontal = speed / 2;

export type WASDMovementActions = "up" | "down" | "left" | "right" | "upleft" | "upright" | "downleft" | "downright";

export const WASDMovementPhysics: ActionMap<WASDMovementActions> = {
  "up": ValidAction((entity: Entity<Position>) => move(entity, "u", { x: -speedDiagonal, y: -speedDiagonal })),
  "down": ValidAction((entity: Entity<Position>) => move(entity, "d", { x: speedDiagonal, y: speedDiagonal })),
  "left": ValidAction((entity: Entity<Position>) => move(entity, "l", { x: -speedHorizontal, y: speedHorizontal })),
  "right": ValidAction((entity: Entity<Position>) => move(entity, "r", { x: speedHorizontal, y: -speedHorizontal })),
  "upleft": ValidAction((entity: Entity<Position>) => move(entity, "ul", { x: -speed, y: 0 })),
  "upright": ValidAction((entity: Entity<Position>) => move(entity, "ur", { x: 0, y: -speed })),
  "downleft": ValidAction((entity: Entity<Position>) => move(entity, "dl", { x: 0, y: speed })),
  "downright": ValidAction((entity: Entity<Position>) => move(entity, "dr", { x: speed, y: 0 }))
}

// shout out to chatgpt (best programmer i know fr)
const move = (entity: Entity<Position>, animation: string | undefined, velocity: { x: number, y: number }) => {
  const { position, renderable } = entity.components;

  if (currentJoystickPosition.power) {
    const { power, angle } = currentJoystickPosition;

    // make the joystick feel stiff
    const powerToApply = Math.min(1, power * 2);

    // Adjusting the angle to match the isometric projection
    const angleAdjusted = angle + 45;
    const angleRad = angleAdjusted * Math.PI / 180;

    // x,y components of the vector
    let cosAngle = Math.cos(angleRad);
    let sinAngle = -Math.sin(angleRad);

    // Adjusting for consistent speed in isometric projection
    const magnitude = Math.sqrt(cosAngle * cosAngle + sinAngle * sinAngle);
    cosAngle /= magnitude;
    sinAngle /= magnitude;

    // Apply the power to the vector
    velocity.x = cosAngle * powerToApply * speed;
    velocity.y = sinAngle * powerToApply * speed;
  }

  position.setVelocity(velocity);

  if (renderable && animation) renderable.setAnimation(animation);
}
