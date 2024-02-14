import { Component } from "@piggo-legends/core";
import { Body, Bodies, IChamferableBodyDefinition } from "matter-js";

export type ColliderMJSProps = {
  radius?: number
  length?: number
  width?: number
  isStatic?: boolean
  frictionAir?: number
}

export class ColliderMJS extends Component<"colliderMJS"> {
  type: "colliderMJS" = "colliderMJS";
  body: Body;

  constructor({ radius, length, width, isStatic, frictionAir }: ColliderMJSProps) {
    super();
    const options: IChamferableBodyDefinition = {
      isStatic: isStatic ?? false,
      frictionAir: frictionAir ?? 0,
      restitution: 0.9,
    }

    if (radius) {
      this.body = Bodies.circle(0, 0, radius ?? 0, options);
    } else {
      this.body = Bodies.rectangle(0, 0, length ?? 1, width ?? 1, options);
    }
  }
}
