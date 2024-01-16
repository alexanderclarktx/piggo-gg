import { Component } from "@piggo-legends/core";
import { Bodies, Body } from "matter-js";

export type ColliderProps = {
  radius?: number
  length?: number
  width?: number
  isStatic?: boolean
}

export class Collider implements Component<"collider"> {
  type: "collider";

  body: Body;

  constructor({ radius, length, width, isStatic }: ColliderProps) {
    const options = { isStatic: isStatic ?? false, airFriction: 0 };
    if (radius) {
      this.body = Bodies.circle(0, 0, radius ?? 0, options);
    } else {
      this.body = Bodies.rectangle(0, 0, length ?? 1, width ?? 1, options);
    }
  }
}
