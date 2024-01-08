

import { Component } from "@piggo-legends/core";

export type ColliderProps = {
  x: number;
  y: number;
  // active: boolean;
}

export class Collider implements Component<"colider"> {
  type: "colider";

  x: number;
  y: number;
  // active: boolean;

  constructor(props: ColliderProps) {
    this.x = props.x;
    this.y = props.y;
    // this.active = props.active;
  }
}
