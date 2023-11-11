import { Component } from "@piggo-legends/core";

export type SerializedPosition = { x: number, y: number, rotation: number }
export type PositionOffset = "world" | "camera";

// the entity's position in the world
export class Position implements Component<"position"> {
  type: "position";

  rotation: Rotation = new Rotation();
  x: number;
  y: number;
  offset: PositionOffset;

  constructor(x: number, y: number, offset: PositionOffset = "world") {
    this.x = x;
    this.y = y;
    this.offset = offset;
  }

  serialize = (): SerializedPosition => {
    return {
      x: this.x,
      y: this.y,
      rotation: this.rotation.rads
    }
  }

  deserialize = ({x, y, rotation}: SerializedPosition) => {
    this.x = x;
    this.y = y;
    this.rotation.rads = rotation;
  }
}

export class Rotation {
  rads: number = 0;

  minus = (amount: number) => {
    this.rads -= +amount.toFixed(2);
  }

  plus = (amount: number) => {
    this.rads += +amount.toFixed(2);
  }
}
