import { Component, Entity, Position, World } from "@piggo-gg/core"
import { Collider as RapierCollider, ColliderDesc, RigidBody, RigidBodyDesc } from "@dimforge/rapier2d-compat"

export type ColliderShapes = "ball" | "cuboid" | "line"

export type SensorCallback = (e2: Entity<Position>, world: World) => boolean

export type Collider = Component<"collider"> & {
  type: "collider"
  bodyDesc: RigidBodyDesc
  colliderDesc: ColliderDesc
  rapierCollider: RapierCollider | undefined
  body: RigidBody | undefined
  priority: number
  hittable: boolean
  sensor: SensorCallback
}

export type ColliderProps = {
  shape: ColliderShapes

  hittable?: boolean
  points?: number[]
  radius?: number
  length?: number
  ccd?: boolean
  width?: number
  isStatic?: boolean
  frictionAir?: number
  mass?: number
  restitution?: number
  rotation?: number
  priority?: number
  sensor?: SensorCallback
}

// TODO Collider.frictionAir deprecated
export const Collider = (props: ColliderProps): Collider => {

  const { shape, ccd, hittable, points, radius, length, width, isStatic, frictionAir, mass, restitution, sensor, rotation, priority } = props

  let colliderDesc: ColliderDesc

  if (shape === "ball" && radius) {
    colliderDesc = ColliderDesc.ball(radius)
  } else if (shape === "cuboid") {
    colliderDesc = ColliderDesc.cuboid(length ?? 1, width ?? 1)
  } else if (shape === "line" && points) {
    const s = ColliderDesc.polyline(Float32Array.from(points))
    colliderDesc = s
  } else {
    throw new Error("Invalid collider shape")
  }

  let bodyDesc: RigidBodyDesc
  if (isStatic) {
    bodyDesc = RigidBodyDesc.fixed()
  } else {
    bodyDesc = RigidBodyDesc.dynamic()
  }

  if (ccd) bodyDesc.setCcdEnabled(true)

  if (sensor) {
    colliderDesc.setSensor(true)
  }

  if (mass) colliderDesc.setMass(mass)

  if (restitution) colliderDesc.setRestitution(restitution)

  if (rotation) colliderDesc.setRotation(rotation)

  bodyDesc.setLinearDamping(frictionAir ?? 0)

  const collider: Collider = {
    type: "collider",
    colliderDesc: colliderDesc,
    rapierCollider: undefined,
    body: undefined,
    bodyDesc,
    sensor: sensor ?? (() => false),
    priority: priority ?? 0,
    hittable: hittable ?? false
  }

  return collider
}
