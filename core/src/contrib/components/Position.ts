import { Component } from "@piggo-gg/core";

export type PositionProps = {
  x?: number
  y?: number
  velocityX?: number
  velocityY?: number
  velocityResets?: number
  screenFixed?: boolean
}

export const worldToIsometric = ({ x, y }: { x: number, y: number }): { x: number, y: number } => ({
  x: x - y,
  y: (x + y) / 2
});

export const isometricToWorld = ({ x, y }: { x: number, y: number }): { x: number, y: number } => ({
  x: (2 * y + x) / 2,
  y: (2 * y - x) / 2
});

// the entity's position in the world
export class Position extends Component<"position"> {
  type: "position" = "position";

  ortho = 0; // TODO use this to set character sprite animations

  override data = {
    x: 0,
    y: 0,
    headingX: NaN,
    headingY: NaN,
    rotation: 0,
    velocityX: 0,
    velocityY: 0,
    velocityResets: 0
  }

  screenFixed: boolean;

  constructor({ x, y, velocityX, velocityY, screenFixed, velocityResets }: PositionProps = {}) {
    super();
    this.data.x = x ?? 0;
    this.data.y = y ?? 0;
    this.data.velocityX = velocityX ?? 0;
    this.data.velocityY = velocityY ?? 0;
    this.screenFixed = screenFixed ?? false;
    this.data.velocityResets = velocityResets ?? 0;
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

  setHeading = ({ x, y }: { x: number, y: number }) => {
    this.data.headingX = x;
    this.data.headingY = y;

    // set velocity toward heading from current position
    const dx = x - this.data.x;
    const dy = y - this.data.y;

    const angle = Math.atan2(dy, dx);
    const Vx = Math.cos(angle) * 140;
    const Vy = Math.sin(angle) * 140;

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
