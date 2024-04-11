import { ActionMap, ControllerMap, currentJoystickPosition } from "@piggo-gg/core";

const speed = 140;
const speedDiagonal = speed / Math.sqrt(2);
const speedHorizontal = speed / 2;

type WASDParams = { animation: string, x: number, y: number };

const getAnimationXYForJoystick = (): WASDParams => {
  console.log("getAnimationXYForJoystick");
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
  const x = cosAngle * powerToApply * speed;
  const y = sinAngle * powerToApply * speed;

  let animation = "";

  const increment = currentJoystickPosition.angle / (360 / 8);

  ((increment > 0.5) && (increment < 1.5)) ?
    animation = "ur" :
    ((increment > 0.5) && (increment < 2.5)) ? animation = "u" :
    ((increment > 0.5) && (increment < 3.5)) ? animation = "ul" :
    ((increment > 0.5) && (increment < 4.5)) ? animation = "l" :
    ((increment > 0.5) && (increment < 5.5)) ? animation = "dl" :
    ((increment > 0.5) && (increment < 6.5)) ? animation = "d" :
    ((increment > 0.5) && (increment < 7.5)) ? animation = "dr" :
    animation = "r";

  return { x, y, animation };
}

export const WASDController: ControllerMap<"move" | "shoot", WASDParams | { mouse: { x: number, y: number }}> = {
  keyboard: {
    "a,d": () => null, "w,s": () => null,
    "w,a": () => ({ action: "move", params: { animation: "ul", x: -speed, y: 0 } }),
    "w,d": () => ({ action: "move", params: { animation: "ur", x: 0, y: -speed } }),
    "s,a": () => ({ action: "move", params: { animation: "dl", x: 0, y: speed } }),
    "s,d": () => ({ action: "move", params: { animation: "dr", x: speed, y: 0 } }),
    "w": () => ({ action: "move", params: { animation: "u", x: -speedDiagonal, y: -speedDiagonal } }),
    "s": () => ({ action: "move", params: { animation: "d", x: speedDiagonal, y: speedDiagonal } }),
    "a": () => ({ action: "move", params: { animation: "l", x: -speedHorizontal, y: speedHorizontal } }),
    "d": () => ({ action: "move", params: { animation: "r", x: speedHorizontal, y: -speedHorizontal } }),
    "mb1": (mouse) => ({ action: "shoot", params: { mouse } })
  },
  joystick: () => ({ action: "move", params: getAnimationXYForJoystick() })
}

export const WASDActionMap: ActionMap<"move", WASDParams> = {
  move: {
    apply: ({ params, entity }) => {
      if (!entity) return;

      const { position, renderable } = entity.components;

      position?.setVelocity({ x: params.x, y: params.y });

      if (renderable && params.animation) renderable.setAnimation(params.animation);
    }
  }
};
