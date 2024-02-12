import { Component } from "@piggo-legends/core";
import { Bodies, Body, IChamferableBodyDefinition } from "matter-js";

export type ColliderProps = {
  radius?: number
  length?: number
  width?: number
  isStatic?: boolean
  frictionAir?: number
}

export class Collider extends Component<"collider"> {
  type: "collider" = "collider";
  body: Body;

  constructor({ radius, length, width, isStatic, frictionAir }: ColliderProps) {
    super();
    const options: IChamferableBodyDefinition = {
      isStatic: isStatic ?? false,
      frictionAir: frictionAir ?? 0
    }

    if (radius) {
      this.body = Bodies.circle(0, 0, radius ?? 0, options);
    } else {
      this.body = Bodies.rectangle(0, 0, length ?? 1, width ?? 1, options);
    }
  }
}
