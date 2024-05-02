import { ActionMap, ControllerMap, currentJoystickPosition } from "@piggo-gg/core";

const speed = 120;

type WASDParams = { x: number, y: number };

const norm = <T extends { x: number, y: number }>(blob: T): T => {

  const { x, y } = blob;

  if (x === 0) return { ...blob, y: Math.sign(y) * speed };
  if (y === 0) return { ...blob, x: Math.sign(x) * speed };

  const ratio = x * x / (y * y);

  const newX = Math.sqrt(speed * speed / (1 + ratio)) * Math.sign(x);
  const newY = Math.sqrt(speed * speed / (1 + 1 / ratio)) * Math.sign(y);

  const result = { ...blob, x: newX, y: newY };
  return result;
}

const getAnimationXYForJoystick = (): WASDParams => {
  console.log("getAnimationXYForJoystick");
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
  const x = cosAngle * powerToApply * speed;
  const y = sinAngle * powerToApply * speed;

  return { x, y };
}

export const WASDController: ControllerMap<WASDParams | { mouse: { x: number, y: number } }> = {
  keyboard: {
    "a,d": () => null, "w,s": () => null,
    "w,a": () => ({ action: "move", params: norm({ x: -1, y: -2 }) }),
    "w,d": () => ({ action: "move", params: norm({ x: 1, y: -2 }) }),
    "s,a": () => ({ action: "move", params: norm({ x: -1, y: 2 }) }),
    "s,d": () => ({ action: "move", params: norm({ x: 1, y: 2 }) }),
    "w": () => ({ action: "move", params: norm({ x: 0, y: -1 }) }),
    "a": () => ({ action: "move", params: norm({ x: -1, y: 0 }) }),
    "d": () => ({ action: "move", params: norm({ x: 1, y: 0 }) }),
    "s": () => ({ action: "move", params: norm({ x: 0, y: 1 }) }),
    "q": ({ mouse }) => ({ action: "Q", params: { mouse } }),
    "mb1": ({ mouse }) => ({ action: "shoot", params: { mouse } }),
    "mb2": ({ mouse, entity }) => {
      const { position, renderable } = entity.components;
      if (!position || !renderable) return null;

      return { action: "head", params: { animation: "u", x: mouse.x, y: mouse.y } };
    }
  },
  joystick: () => ({ action: "move", params: getAnimationXYForJoystick() })
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
