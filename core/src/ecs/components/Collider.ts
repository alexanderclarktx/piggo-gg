import { Component, Entity, Position, World } from "@piggo-gg/core";
import { Collider as RapierCollider, ColliderDesc, RigidBody, RigidBodyDesc } from "@dimforge/rapier2d-compat";

export type ColliderShapes = "ball" | "cuboid" | "line";

export type ColliderProps = {
  shape: ColliderShapes
  shootable?: boolean
  points?: number[]
  radius?: number
  length?: number
  ccd?: boolean
  width?: number
  isStatic?: boolean
  frictionAir?: number
  mass?: number // default 100
  restitution?: number
  rotation?: number
  priority?: number
  sensor?: (e2: Entity<Position>, world: World) => void
}

export class Collider extends Component<"collider"> {
  type: "collider" = "collider";
  bodyDesc: RigidBodyDesc;
  colliderDesc: ColliderDesc;
  rapierCollider: RapierCollider;
  body: RigidBody;
  priority: number;
  shootable: boolean;

  sensor: (e2: Entity<Position>, world: World) => void;

  constructor({ shape, ccd, shootable, points, radius, length, width, isStatic, frictionAir, mass, restitution, sensor, rotation, priority }: ColliderProps) {
    super();

    if (isStatic) {
      this.bodyDesc = RigidBodyDesc.fixed();
    } else {
      this.bodyDesc = RigidBodyDesc.dynamic();
    }

    if (shape === "ball" && radius) {
      this.colliderDesc = ColliderDesc.ball(radius);
    } else if (shape === "cuboid") {
      this.colliderDesc = ColliderDesc.cuboid(length ?? 1, width ?? 1);
    } else if (shape === "line" && points) {
      const s = ColliderDesc.polyline(Float32Array.from(points));
      this.colliderDesc = s;
    }

    if (sensor) {
      this.colliderDesc.setSensor(true);
      this.sensor = sensor;
    }

    if (ccd) this.bodyDesc.setCcdEnabled(true);

    this.shootable = shootable ?? false;

    this.priority = priority ?? 0;

    if (mass) this.colliderDesc.setMass(mass);
    if (restitution) this.colliderDesc.setRestitution(restitution);
    if (rotation) this.colliderDesc.setRotation(rotation);

    this.bodyDesc.setLinearDamping(frictionAir ?? 0);
  }
}