import { Component } from "@piggo-legends/core";

// the entity's position in the world
export class Velocity implements Component<"velocity"> {
  type: "velocity";

  v: number;

  constructor(v: number = 0) {
    this.v = v;
  }
}
