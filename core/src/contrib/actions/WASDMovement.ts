import { ActionMap, InputMap, Entity, Position, currentJoystickPosition, normalize, World, InvokedAction, XY, JoystickHandler } from "@piggo-gg/core";

export const WASDJoystick: JoystickHandler = ({ entity, world }) => ({
  action: "move", playerId: world.client?.playerId, params: handleJoystick(entity)
})

export const WASDInput: InputMap<XY> = {
  press: {
    "a,d": () => null, "w,s": () => null,
    "w,a": ({ entity, world }) => move(entity, world, -1, -2),
    "w,d": ({ entity, world }) => move(entity, world, 1, -2),
    "s,a": ({ entity, world }) => move(entity, world, -1, 2),
    "s,d": ({ entity, world }) => move(entity, world, 1, 2),
    "w": ({ entity, world }) => move(entity, world, 0, -1),
    "a": ({ entity, world }) => move(entity, world, -1, 0),
    "d": ({ entity, world }) => move(entity, world, 1, 0),
    "s": ({ entity, world }) => move(entity, world, 0, 1),
    "mb2": ({ mouse, entity, world }) => {
      const { position, renderable } = entity.components;
      if (!position || !renderable) return null;
      return { action: "head", playerId: world.client?.playerId, params: { animation: "u", x: mouse.x, y: mouse.y } };
    }
  }
}

const move = (entity: Entity, world: World, x: number, y: number): null | InvokedAction<"move", XY> => {
  if (!entity.components.position) return null;
  return { action: "move", playerId: world.client?.playerId, params: normalize({ x, y, entity: entity as Entity<Position> }) }
}

export const WASDActionMap: ActionMap<XY> = {
  head: {
    invoke: ({ params, entity }) => {
      if (!entity) return;

      const { position } = entity.components;

      position?.setHeading({ x: params.x, y: params.y });
    }
  },
  move: {
    invoke: ({ params, entity }) => {
      if (!entity) return;

      const { position } = entity.components;

      position?.setHeading({ x: NaN, y: NaN });
      position?.setVelocity({ x: params.x, y: params.y });
    }
  }
};

const handleJoystick = (entity: Entity<Position>): XY => {
  const { position } = entity.components;
  const { power, angle } = currentJoystickPosition;

  // make the joystick feel stiff
  const powerToApply = Math.min(1, power * 2);

  // convert the angle to radians
  const angleRad = angle * Math.PI / 180;

  // x,y components of the vector
  let cosAngle = Math.cos(angleRad);
  let sinAngle = -Math.sin(angleRad);

  // Adjusting for consistent speed in isometric projection
  const magnitude = Math.sqrt(cosAngle * cosAngle + sinAngle * sinAngle);
  cosAngle /= magnitude;
  sinAngle /= magnitude;

  // Apply the power to the vector
  const x = cosAngle * powerToApply * position.data.speed;
  const y = sinAngle * powerToApply * position.data.speed;

  return { x, y };
}
