import { Component } from "@piggo-legends/core";

export class Velocity implements Component<"velocity"> {
  type: "velocity";

  v: number;

  constructor(v: number = 0) {
    this.v = v;
  }
}
