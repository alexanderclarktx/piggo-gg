import { Component } from "@piggo-gg/core";

export type PositionProps = {
  x?: number
  y?: number
  velocityX?: number
  velocityY?: number
  velocityResets?: number
  screenFixed?: boolean
  speed?: number
}

// the entity's position in the world
export class Position extends Component<"position"> {
  type: "position" = "position";

  ortho = 0;

  override data = {
    x: 0,
    y: 0,
    headingX: NaN,
    headingY: NaN,
    rotation: 0,
    speed: 0,
    velocityX: 0,
    velocityY: 0,
    velocityResets: 0
  }

  screenFixed: boolean;

  constructor({ x, y, velocityX, velocityY, screenFixed, velocityResets, speed }: PositionProps = {}) {
    super();
    this.data.x = x ?? 0;
    this.data.y = y ?? 0;
    this.data.velocityX = velocityX ?? 0;
    this.data.velocityY = velocityY ?? 0;
    this.screenFixed = screenFixed ?? false;
    this.data.velocityResets = velocityResets ?? 0;
    this.data.speed = speed ?? 400;
  }

  setPosition = ({ x, y }: { x: number, y: number }) => {
    this.data.x = x;
    this.data.y = y;
    return this;
  }

  setVelocity = ({ x, y }: { x: number, y: number }) => {
    this.data.velocityX = x;
    this.data.velocityY = y;

    if (x || y) this.ortho = Math.round((Math.atan2(y, x) / Math.PI) * 4 + 4) % 8;

    return this;
  }

  setSpeed = (speed: number) => {
    this.data.speed = speed;
  }

  setHeading = ({ x, y }: { x: number, y: number }) => {
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
