import { Component } from "@piggo-legends/core";

export type ColliderProps = {
  x: number;
  y: number;
}

export class Collider implements Component<"collider"> {
  type: "collider";

  x: number;
  y: number;

  constructor(props: ColliderProps) {
    this.x = props.x;
    this.y = props.y;
  }
}
