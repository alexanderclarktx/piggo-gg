import { Component } from "@piggo-gg/core";

export type PositionProps = {
  x?: number
  y?: number
  velocityX?: number
  velocityY?: number
  velocityResets?: number
  offset?: "world" | "camera"
  screenFixed?: boolean
  renderMode?: "isometric" | "cartesian"
}

export const worldToScreen = ({ x, y }: { x: number, y: number }): { x: number, y: number } => ({
  x: x - y,
  y: (x + y) / 2
});

export const screenToWorld = ({ x, y }: { x: number, y: number }): { x: number, y: number } => ({
  x: (2 * y + x) / 2,
  y: (2 * y - x) / 2
});

// the entity's position in the world
export class Position extends Component<"position"> {
  type: "position" = "position";

  override data = {
    x: 0,
    y: 0,
    rotation: 0,
    velocityX: 0,
    velocityY: 0,
    velocityResets: 0
  }

  offset: "world" | "camera";
  screenFixed: boolean;

  // TODO refactor and consolidate this somewhere
  renderMode: "isometric" | "cartesian";

  constructor({ x, y, velocityX, velocityY, offset, screenFixed, renderMode, velocityResets }: PositionProps = {}) {
    super();
    this.data.x = x ?? 0;
    this.data.y = y ?? 0;
    this.data.velocityX = velocityX ?? 0;
    this.data.velocityY = velocityY ?? 0;
    this.offset = offset ?? "world";
    this.screenFixed = screenFixed ?? false;
    this.renderMode = renderMode ?? "cartesian";
    this.data.velocityResets = velocityResets ?? 0;
  }

  // get screen coordinates from world position
  toScreenXY = (): { x: number, y: number } => {
    return worldToScreen({ x: this.data.x, y: this.data.y });
  }

  // set world position from screen coordinates
  fromScreenXY = (screenX: number, screenY: number) => {
    return screenToWorld({ x: screenX, y: screenY });
  }

  setPosition = ({ x, y }: { x: number, y: number }) => {
    this.data.x = x;
    this.data.y = y;
    return this;
  }

  setVelocity = ({ x, y }: { x: number, y: number }) => {
    this.data.velocityX = x;
    this.data.velocityY = y;
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
