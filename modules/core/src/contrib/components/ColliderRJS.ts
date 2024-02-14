import { Component } from "@piggo-legends/core";
import { ColliderDesc, RigidBodyDesc } from "@dimforge/rapier2d-compat";

export type ColliderRJSProps = {
  radius?: number
  length?: number
  width?: number
  isStatic?: boolean
  frictionAir?: number
}

export class ColliderRJS extends Component<"colliderRJS"> {
  type: "colliderRJS" = "colliderRJS";
  body: RigidBodyDesc;
  c: ColliderDesc;


  constructor({ radius, length, width, isStatic, frictionAir }: ColliderRJSProps) {
    super();

    if (radius) {
      this.body = RigidBodyDesc.dynamic();
      this.c = ColliderDesc.ball(radius)
    } else {
      this.body = RigidBodyDesc.dynamic();
      this.c = ColliderDesc.cuboid(length ?? 1, width ?? 1);
    }
  }
}
