import { Component } from "@piggo-legends/core";

// export type SerializedPosition = { x: number, y: number, rotation: number }
// export type PositionOffset = "world" | "camera";

// the entity's position in the world
export class Velocity implements Component<"velocity"> {
  type: "velocity";

  v: number; // speed

  constructor(v: number = 0) {
    this.v = v;
  }

  // serialize = (): SerializedPosition => {
  //   return {
  //     x: this.x,
  //     y: this.y,
  //     rotation: this.rotation.rads
  //   }
  // }

  // deserialize = ({x, y, rotation}: SerializedPosition) => {
  //   this.x = x;
  //   this.y = y;
  //   this.rotation.rads = rotation;
  // }
}
