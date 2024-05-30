import { Entity, JoystickHandler, Position, Renderable, XY } from "@piggo-gg/core";
import { Container, FederatedPointerEvent, Graphics, Point, Sprite } from "pixi.js";

export const currentJoystickPosition = { angle: 0, power: 0, active: false }

export const Joystick = (): Entity => {
  const joystick = Entity<Renderable | Position>({
    id: "joystick",
    persists: true,
    components: {
      position: new Position({ x: -100, y: -100, screenFixed: true }),
      renderable: new Renderable({
        zIndex: 10,
        interactiveChildren: true,
        setContainer: async () => {
          return new JoystickContainer({
            onChange: (data) => {
              currentJoystickPosition.angle = data.angle;
              currentJoystickPosition.power = data.power;
            },
            onEnd: () => {
              currentJoystickPosition.power = 0;
              currentJoystickPosition.angle = 0;
              currentJoystickPosition.active = false;
            },
            onStart: () => {
              currentJoystickPosition.active = true;
            }
          })
        }
      })
    }
  });
  return joystick;
}

export const WASDJoystick: JoystickHandler = ({ entity, world }) => ({
  action: "move", playerId: world.client?.playerId, params: handleJoystick(entity)
});

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

type Direction = "left" | "top" | "bottom" | "right" | "top_left" | "top_right" | "bottom_left" | "bottom_right";

export interface JoystickChangeEvent {
  angle: number
  direction: Direction
  power: number
}

export interface JoystickSettings {
  outer?: Sprite | Graphics | Container,
  inner?: Sprite | Graphics | Container,
  outerScale?: XY,
  innerScale?: XY,
  onChange?: (data: JoystickChangeEvent) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

// from https://github.com/endel/pixi-virtual-joystick/
export class JoystickContainer extends Container {
  settings: JoystickSettings;

  outerRadius: number = 0;
  innerRadius: number = 0;

  outer!: Sprite | Graphics | Container;
  inner!: Sprite | Graphics | Container;

  innerAlphaStandby = 0.5;

  constructor(opts: JoystickSettings = {}) {
    super();

    this.settings = Object.assign({
      outerScale: { x: 1, y: 1 },
      innerScale: { x: 1, y: 1 },
    }, opts);

    if (!this.settings.outer) {
      const outer = new Graphics();
      outer.circle(0, 0, 60);
      outer.fill({ color: 0x005588, alpha: 0.9 });
      this.settings.outer = outer;
    }

    if (!this.settings.inner) {
      const inner = new Graphics();
      inner.circle(0, 0, 30);
      inner.fill({ color: 0xffff00, alpha: 0.8 });
      inner.alpha = this.innerAlphaStandby;
      this.settings.inner = inner;
    }

    this.initialize();
  }

  initialize() {
    this.outer = this.settings.outer!;
    this.inner = this.settings.inner!;

    this.outer.scale.set(this.settings.outerScale!.x, this.settings.outerScale!.y);
    this.inner.scale.set(this.settings.innerScale!.x, this.settings.innerScale!.y);

    if ("anchor" in this.outer) { this.outer.anchor.set(0.5); }
    if ("anchor" in this.inner) { this.inner.anchor.set(0.5); }

    this.addChild(this.outer);
    this.addChild(this.inner);

    this.outerRadius = this.width / 2.5;
    this.innerRadius = this.inner.width / 2;

    this.bindEvents();
  }

  protected bindEvents() {
    let that = this;
    this.interactive = true;

    let dragging: boolean = false;
    let power: number;
    let startPosition: Point;

    function onDragStart(event: FederatedPointerEvent) {
      startPosition = that.toLocal(event.global);

      dragging = true;
      that.inner.alpha = 1;

      that.settings.onStart?.();
    }

    function onDragEnd(event: FederatedPointerEvent) {
      if (dragging == false) { return; }

      that.inner.position.set(0, 0);

      dragging = false;
      that.inner.alpha = that.innerAlphaStandby;

      that.settings.onEnd?.();
    }

    function onDragMove(event: FederatedPointerEvent) {
      if (dragging == false) { return; }

      let newPosition = that.toLocal(event.global);

      let sideX = newPosition.x - startPosition.x;
      let sideY = newPosition.y - startPosition.y;

      let centerPoint = new Point(0, 0);
      let angle = 0;

      if (sideX == 0 && sideY == 0) { return; }

      /**
       * x:   -1 <-> 1
       * y:   -1 <-> 1
       *          Y
       *          ^
       *          |
       *     180  |  90
       *    ------------> X
       *     270  |  360
       *          |
       *          |
       */

      let direction: Direction = "left";

      if (sideX == 0) {
        if (sideY > 0) {
          centerPoint.set(0, (sideY > that.outerRadius) ? that.outerRadius : sideY);
          angle = 270;
          direction = "bottom";
        } else {
          centerPoint.set(0, -(Math.abs(sideY) > that.outerRadius ? that.outerRadius : Math.abs(sideY)));
          angle = 90;
          direction = "top";
        }
        that.inner.position.set(centerPoint.x, centerPoint.y);
        power = that.getPower(centerPoint);
        that.settings.onChange?.({ angle, direction, power, });
        return;
      }

      if (sideY == 0) {
        if (sideX > 0) {
          centerPoint.set((Math.abs(sideX) > that.outerRadius ? that.outerRadius : Math.abs(sideX)), 0);
          angle = 0;
          direction = "left";
        } else {
          centerPoint.set(-(Math.abs(sideX) > that.outerRadius ? that.outerRadius : Math.abs(sideX)), 0);
          angle = 180;
          direction = "right";
        }

        that.inner.position.set(centerPoint.x, centerPoint.y);
        power = that.getPower(centerPoint);
        that.settings.onChange?.({ angle, direction, power, });
        return;
      }

      let tanVal = Math.abs(sideY / sideX);
      let radian = Math.atan(tanVal);
      angle = radian * 180 / Math.PI;

      let centerX = 0;
      let centerY = 0;

      if (sideX * sideX + sideY * sideY >= that.outerRadius * that.outerRadius) {
        centerX = that.outerRadius * Math.cos(radian);
        centerY = that.outerRadius * Math.sin(radian);
      }
      else {
        centerX = Math.abs(sideX) > that.outerRadius ? that.outerRadius : Math.abs(sideX);
        centerY = Math.abs(sideY) > that.outerRadius ? that.outerRadius : Math.abs(sideY);
      }

      if (sideY < 0) {
        centerY = -Math.abs(centerY);
      }
      if (sideX < 0) {
        centerX = -Math.abs(centerX);
      }

      if (sideX > 0 && sideY < 0) {
        // < 90
      }
      else if (sideX < 0 && sideY < 0) {
        // 90 ~ 180
        angle = 180 - angle;
      }
      else if (sideX < 0 && sideY > 0) {
        // 180 ~ 270
        angle = angle + 180;
      }
      else if (sideX > 0 && sideY > 0) {
        // 270 ~ 369
        angle = 360 - angle;
      }
      centerPoint.set(centerX, centerY);
      power = that.getPower(centerPoint);

      direction = that.getDirection(centerPoint);
      that.inner.position.set(centerPoint.x, centerPoint.y);

      that.settings.onChange?.({ angle, direction, power, });
    };

    this.on("pointerdown", onDragStart).on("pointerup", onDragEnd).on("pointerupoutside", onDragEnd).on("globalpointermove", onDragMove);
  }

  protected getPower(centerPoint: Point) {
    const a = centerPoint.x - 0;
    const b = centerPoint.y - 0;
    return Math.min(1, Math.sqrt(a * a + b * b) / this.outerRadius);
  }

  protected getDirection(center: Point): Direction {
    let rad = Math.atan2(center.y, center.x);// [-PI, PI]
    if ((rad >= -Math.PI / 8 && rad < 0) || (rad >= 0 && rad < Math.PI / 8)) {
      return "right";
    } else if (rad >= Math.PI / 8 && rad < 3 * Math.PI / 8) {
      return "bottom_right";
    } else if (rad >= 3 * Math.PI / 8 && rad < 5 * Math.PI / 8) {
      return "bottom";
    } else if (rad >= 5 * Math.PI / 8 && rad < 7 * Math.PI / 8) {
      return "bottom_left";
    } else if ((rad >= 7 * Math.PI / 8 && rad < Math.PI) || (rad >= -Math.PI && rad < -7 * Math.PI / 8)) {
      return "left";
    } else if (rad >= -7 * Math.PI / 8 && rad < -5 * Math.PI / 8) {
      return "top_left";
    } else if (rad >= -5 * Math.PI / 8 && rad < -3 * Math.PI / 8) {
      return "top";
    } else {
      return "top_right";
    }
  }
}
