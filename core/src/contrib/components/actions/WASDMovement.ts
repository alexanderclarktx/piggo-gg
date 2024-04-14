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

export const WASDController: ControllerMap<"move" | "shoot" | "head", WASDParams | { mouse: { x: number, y: number }}> = {
  keyboard: {
    "a,d": () => null, "w,s": () => null,
    "w,a": () => ({ action: "move", params: { animation: "ul", x: -speedDiagonal, y: -speedDiagonal } }),
    "w,d": () => ({ action: "move", params: { animation: "ur", x: speedDiagonal, y: -speedDiagonal } }),
    "s,a": () => ({ action: "move", params: { animation: "dl", x: -speedDiagonal, y: speedDiagonal } }),
    "s,d": () => ({ action: "move", params: { animation: "dr", x: speedDiagonal, y: speedDiagonal } }),
    "w": () => ({ action: "move", params: { animation: "u", x: 0, y: -speed } }),
    "s": () => ({ action: "move", params: { animation: "d", x: 0, y: speed } }),
    "a": () => ({ action: "move", params: { animation: "l", x: -speed, y: 0 } }),
    "d": () => ({ action: "move", params: { animation: "r", x: speed, y: 0 } }),
    "mb1": ({ mouse }) => ({ action: "shoot", params: { mouse } }),
    "mb2": ({ mouse, entity } ) => {
      const { position, renderable } = entity.components;
      if (!position || !renderable) return null;

      // set the heading
      // position.setHeading({ x: mouse.x, y: mouse.y });

      const dx = mouse.x - position.data.x;
      const dy = mouse.y - position.data.y;

      const tau16 = (Math.PI * 2) / 16; // 22.5 degrees
      const angle = Math.atan2(dy, dx) + tau16 * 8;

      if (angle >= 0 && angle < 1 * tau16) renderable.setAnimation("ul");
      else if (angle >= 15 * tau16 && angle < 16 * tau16) renderable.setAnimation("l");
      else if (angle >= 1 * tau16 && angle < 3 * tau16) renderable.setAnimation("ul");
      else if (angle >= 3 * tau16 && angle < 5 * tau16) renderable.setAnimation("u");
      else if (angle >= 5 * tau16 && angle < 7 * tau16) renderable.setAnimation("ur");
      else if (angle >= 7 * tau16 && angle < 9 * tau16) renderable.setAnimation("r");
      else if (angle >= 9 * tau16 && angle < 11 * tau16) renderable.setAnimation("dr");
      else if (angle >= 11 * tau16 && angle < 13 * tau16) renderable.setAnimation("d");
      else if (angle >= 13 * tau16 && angle < 15 * tau16) renderable.setAnimation("dl");

      return { action: "head", params: { animation: "u", x: mouse.x, y: mouse.y } };
    }
  },
  joystick: () => ({ action: "move", params: getAnimationXYForJoystick() })
}

export const WASDActionMap: ActionMap<"move" | "head", WASDParams> = {
  head: {
    apply: ({ params, entity }) => {
      if (!entity) return;

      const { position } = entity.components;

      position?.setHeading({ x: params.x, y: params.y });
    }
  },
  move: {
    apply: ({ params, entity }) => {
      if (!entity) return;

      const { position, renderable } = entity.components;

      position?.setHeading({ x: NaN, y: NaN });

      position?.setVelocity({ x: params.x, y: params.y });

      if (renderable && params.animation) renderable.setAnimation(params.animation);
    }
  }
};
