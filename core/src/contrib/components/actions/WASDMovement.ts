import { ActionMap, ControllerMap, Entity, Position, currentJoystickPosition, normalize } from "@piggo-gg/core";

type WASDParams = { x: number, y: number };

export const WASDController: ControllerMap<WASDParams | { mouse: { x: number, y: number } }> = {
  keyboard: {
    "a,d": () => null, "w,s": () => null,
    "w,a": ({ entity }) => ({ action: "move", params: normalize({ x: -1, y: -2, entity }) }),
    "w,d": ({ entity }) => ({ action: "move", params: normalize({ x: 1, y: -2, entity }) }),
    "s,a": ({ entity }) => ({ action: "move", params: normalize({ x: -1, y: 2, entity }) }),
    "s,d": ({ entity }) => ({ action: "move", params: normalize({ x: 1, y: 2, entity }) }),
    "w": ({ entity }) => ({ action: "move", params: normalize({ x: 0, y: -1, entity }) }),
    "a": ({ entity }) => ({ action: "move", params: normalize({ x: -1, y: 0, entity }) }),
    "d": ({ entity }) => ({ action: "move", params: normalize({ x: 1, y: 0, entity }) }),
    "s": ({ entity }) => ({ action: "move", params: normalize({ x: 0, y: 1, entity }) }),
    "q": ({ mouse }) => ({ action: "Q", params: { mouse } }),
    "mb2": ({ mouse, entity }) => {
      const { position, renderable } = entity.components;
      if (!position || !renderable) return null;

      return { action: "head", params: { animation: "u", x: mouse.x, y: mouse.y } };
    }
  },
  joystick: ({ entity }) => ({ action: "move", params: handleJoystick(entity) })
}

export const WASDActionMap: ActionMap<WASDParams> = {
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

const handleJoystick = (entity: Entity<Position>): WASDParams => {
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
