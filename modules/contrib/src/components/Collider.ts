import { Component } from "@piggo-legends/core";

export type ColliderProps = {
  radius: number
  mass?: number
}

export class Collider implements Component<"collider"> {
  type: "collider";

  radius: number;
  mass: number;

  constructor(props: ColliderProps) {
    this.radius = props.radius;
    this.mass = props.mass ?? 0.001;
  }
}
