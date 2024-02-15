import { Component } from "@piggo-legends/core";
import { Collider, ColliderDesc, RigidBody, RigidBodyDesc } from "@dimforge/rapier2d-compat";

export type ColliderRJSProps = {
  radius?: number
  length?: number
  width?: number
  isStatic?: boolean
  frictionAir?: number
  mass?: number // default mass seems to be 100
  restitution?: number
}

export class ColliderRJS extends Component<"colliderRJS"> {
  type: "colliderRJS" = "colliderRJS";
  bodyDesc: RigidBodyDesc;
  colliderDesc: ColliderDesc;
  collider: Collider;
  body: RigidBody;

  constructor({ radius, length, width, isStatic, frictionAir, mass, restitution }: ColliderRJSProps) {
    super();

    if (isStatic) {
      this.bodyDesc = RigidBodyDesc.fixed();
    } else {
      this.bodyDesc = RigidBodyDesc.dynamic();
    }

    if (radius) {
      this.colliderDesc = ColliderDesc.ball(radius)
    } else {
      this.colliderDesc = ColliderDesc.cuboid(length ?? 1, width ?? 1);
    }

    if (mass) this.colliderDesc.setMass(mass);

    if (restitution) this.colliderDesc.setRestitution(restitution);

    this.bodyDesc.setLinearDamping(frictionAir ?? 0);
  }
}
