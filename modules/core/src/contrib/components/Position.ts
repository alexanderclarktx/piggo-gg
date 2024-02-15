import { Component } from "@piggo-legends/core";

export type PositionProps = {
  x?: number
  y?: number
  velocityResets?: number
  offset?: "world" | "camera"
  screenFixed?: boolean
  renderMode?: "isometric" | "cartesian"
}

export const worldToScreen = ({ x, y }: { x: number, y: number }): { x: number, y: number } => ({
  x: x - y,
  y: (x + y) / 2
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

  constructor({ x, y, offset, screenFixed, renderMode, velocityResets }: PositionProps = {}) {
    super();
    this.data.x = x ?? 0;
    this.data.y = y ?? 0;
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
  fromScreenXY = (isoX: number, isoY: number) => {
    this.data.x = (2 * isoY + isoX) / 2;
    this.data.y = (2 * isoY - isoX) / 2;
  }

  setVelocity = (velocity: { x: number, y: number }) => {
    this.data.velocityX = velocity.x;
    this.data.velocityY = velocity.y;
  }

  rotateUp = (amount: number) => {
    this.data.rotation += +amount.toFixed(2);
  }

  rotateDown = (amount: number) => {
    this.data.rotation -= +amount.toFixed(2);
  }
}
