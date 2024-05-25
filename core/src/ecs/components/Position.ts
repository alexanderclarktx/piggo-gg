import { Component, XY } from "@piggo-gg/core";

export type PositionProps = {
  x?: number
  y?: number
  vx?: number
  vy?: number
  speed?: number
  velocityResets?: number
  screenFixed?: boolean
}

// the entity's position in the world
export class Position extends Component<"position"> {
  type: "position" = "position";

  ortho = 0;
  lastCollided: number = 0;

  override data = {
    x: 0, y: 0,
    vx: 0, vy: 0,
    speed: 0,
    rotation: 0,
    headingX: NaN,
    headingY: NaN,
    velocityResets: 0
  }

  screenFixed: boolean;

  constructor({ x, y, vx, vy, screenFixed, velocityResets, speed }: PositionProps = {}) {
    super();
    this.data.x = x ?? 0;
    this.data.y = y ?? 0;
    this.data.vx = vx ?? 0;
    this.data.vy = vy ?? 0;
    this.screenFixed = screenFixed ?? false;
    this.data.velocityResets = velocityResets ?? 0;
    this.data.speed = speed ?? 400;
  }

  setPosition = ({ x, y }: XY) => {
    this.data.x = x;
    this.data.y = y;
    return this;
  }

  setVelocity = ({ x, y }: XY) => {
    this.data.vx = Math.round(x * 100) / 100;
    this.data.vy = Math.round(y * 100) / 100;

    if (x || y) this.ortho = Math.round((Math.atan2(y, x) / Math.PI) * 4 + 4) % 8;

    return this;
  }

  setSpeed = (speed: number) => {
    this.data.speed = speed;
  }

  // TODO refactor, the xv/vy should be recalculated every tick
  setHeading = ({ x, y }: XY) => {
    this.data.headingX = x;
    this.data.headingY = y;

    // set velocity toward heading from current position
    const dx = x - this.data.x;
    const dy = y - this.data.y;

    const angle = Math.atan2(dy, dx);
    const Vx = Math.cos(angle) * this.data.speed;
    const Vy = Math.sin(angle) * this.data.speed;

    this.setVelocity({ x: Vx, y: Vy });

    return this;
  }

  rotateUp = (amount: number) => {
    this.data.rotation += amount;
    return this;
  }

  rotateDown = (amount: number) => {
    this.data.rotation -= amount;
    return this;
  }
}
