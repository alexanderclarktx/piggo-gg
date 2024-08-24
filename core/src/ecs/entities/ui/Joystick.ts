import { Entity, JoystickHandler, Position, Renderable, XY } from "@piggo-gg/core";
import { Container, FederatedPointerEvent, Graphics, Rectangle } from "pixi.js";

export const CurrentJoystickPosition = { angle: 0, power: 0, active: false }

export const Joystick = (): Entity => {
  const joystick = Entity<Renderable | Position>({
    id: "joystick",
    persists: true,
    components: {
      position: Position({ x: -(window.innerWidth / 2), y: -85, screenFixed: true }),
      renderable: Renderable({
        zIndex: 10,
        interactiveChildren: true,
        setContainer: async () => JoystickContainer({
          onChange: (data) => {
            CurrentJoystickPosition.angle = data.angle;
            CurrentJoystickPosition.power = data.power;
          },
          onEnd: () => {
            CurrentJoystickPosition.power = 0;
            CurrentJoystickPosition.angle = 0;
            CurrentJoystickPosition.active = false;
          },
          onStart: () => {
            CurrentJoystickPosition.active = true;
          }
        })
      })
    }
  });
  return joystick;
}

export const DefaultJoystickHandler: JoystickHandler = ({ character, world }) => ({
  action: "move", playerId: world.client?.playerId(), params: handleJoystick(character)
});

const handleJoystick = (entity: Entity<Position>): XY => {
  const { position } = entity.components;
  const { power, angle } = CurrentJoystickPosition;

  // stiffen the joystick
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

export interface JoystickSettings {
  onChange?: (data: { angle: number, power: number }) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export const JoystickContainer = ({ onChange, onStart, onEnd }: JoystickSettings): Container => {

  const outerRadius = 45;
  const innerRadius = 30;

  let dragging: boolean = false;
  let dragStart: XY;
  let power: number;

  const c = new Container({ interactive: true, hitArea: new Rectangle(-outerRadius, -outerRadius, outerRadius * 2, outerRadius * 2) });

  const outer = new Graphics({ alpha: 0.9 });
  outer.circle(0, 0, outerRadius).fill({ color: 0x005588 });

  const inner = new Graphics({ alpha: 0.5 });
  inner.circle(0, 0, innerRadius).fill({ color: 0xffff00 });

  c.addChild(outer, inner);

  const getPower = (centerPoint: XY) => {
    const a = centerPoint.x - 0;
    const b = centerPoint.y - 0;
    return Math.min(1, Math.sqrt(a * a + b * b) / outerRadius);
  }

  const onDragStart = (event: FederatedPointerEvent) => {
    dragStart = c.toLocal(event.global);

    dragging = true;
    inner.alpha = 1;

    onStart?.();
  }

  const onDragEnd = () => {
    if (dragging === false) return;

    inner.position.set(0, 0);
    dragging = false;
    inner.alpha = 0.5;

    onEnd?.();
  }

  const onDragMove = (event: FederatedPointerEvent) => {
    if (dragging === false) return;

    let newPosition = c.toLocal(event.global);

    let sideX = newPosition.x - dragStart.x;
    let sideY = newPosition.y - dragStart.y;

    let centerPoint: XY = { x: 0, y: 0 };
    let angle = 0;

    if (sideX === 0 && sideY === 0) return;

    if (sideX === 0) {
      if (sideY > 0) {
        centerPoint = { x: 0, y: (sideY > outerRadius) ? outerRadius : sideY };
        angle = 270;
      } else {
        centerPoint = { x: 0, y: -(Math.abs(sideY) > outerRadius ? outerRadius : Math.abs(sideY)) };
        angle = 90;
      }
      inner.position.set(centerPoint.x, centerPoint.y);
      power = getPower(centerPoint);
      onChange?.({ angle, power });
      return;
    }

    if (sideY === 0) {
      if (sideX > 0) {
        centerPoint = { x: (Math.abs(sideX) > outerRadius ? outerRadius : Math.abs(sideX)), y: 0 };
        angle = 0;
      } else {
        centerPoint = { x: -(Math.abs(sideX) > outerRadius ? outerRadius : Math.abs(sideX)), y: 0 };
        angle = 180;
      }

      inner.position.set(centerPoint.x, centerPoint.y);
      power = getPower(centerPoint);
      onChange?.({ angle, power });
      return;
    }

    let tanVal = Math.abs(sideY / sideX);
    let radian = Math.atan(tanVal);
    angle = radian * 180 / Math.PI;

    let centerX = 0;
    let centerY = 0;

    if (sideX * sideX + sideY * sideY >= outerRadius * outerRadius) {
      centerX = outerRadius * Math.cos(radian);
      centerY = outerRadius * Math.sin(radian);
    } else {
      centerX = Math.abs(sideX) > outerRadius ? outerRadius : Math.abs(sideX);
      centerY = Math.abs(sideY) > outerRadius ? outerRadius : Math.abs(sideY);
    }

    if (sideY < 0) {
      centerY = -Math.abs(centerY);
    }
    if (sideX < 0) {
      centerX = -Math.abs(centerX);
    }

    if (sideX > 0 && sideY < 0) {
    } else if (sideX < 0 && sideY < 0) {
      angle = 180 - angle;
    } else if (sideX < 0 && sideY > 0) {
      angle = angle + 180;
    } else if (sideX > 0 && sideY > 0) {
      angle = 360 - angle;
    }

    centerPoint = { x: centerX, y: centerY };
    power = getPower(centerPoint);

    inner.position.set(centerPoint.x, centerPoint.y);

    onChange?.({ angle, power });
  };

  c.on("pointerdown", onDragStart)
    .on("pointerup", onDragEnd)
    .on("pointerupoutside", onDragEnd)
    .on("globalpointermove", onDragMove);

  return c;
}
