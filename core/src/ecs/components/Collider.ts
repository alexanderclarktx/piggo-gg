import { Component, Entity, Position, World } from "@piggo-gg/core"
import { Collider as RapierCollider, ColliderDesc, RigidBody, RigidBodyDesc } from "@dimforge/rapier2d-compat"

export type ColliderShapes = "ball" | "cuboid" | "line"

export type SensorCallback = (e2: Entity<Position | Collider>, world: World) => boolean

export const ColliderGroups = {
  default: "11111111000000001111111100000000",
  none:    "00000000000000000000000000000000",
  notself: "01000000000000001000000000000000",
  two:     "00000000000000100000000000000010",
  three:   "00000000000001000000000000000100"
} as const;

export type Collider = Component<"collider"> & {
  type: "collider"
  bodyDesc: RigidBodyDesc
  colliderDesc: ColliderDesc
  rapierCollider: RapierCollider | undefined
  body: RigidBody | undefined
  priority: number
  hittable: boolean
  sensor: SensorCallback
  setGroup: (group: keyof typeof ColliderGroups) => void
}

export type ColliderProps = {
  shape: ColliderShapes
  hittable?: boolean
  points?: number[]
  radius?: number
  length?: number
  width?: number
  isStatic?: boolean
  frictionAir?: number // TODO deprecated
  mass?: number
  restitution?: number
  rotation?: number
  priority?: number
  sensor?: SensorCallback
  group?: keyof typeof ColliderGroups
}

export const Collider = ({
  shape, hittable, points, radius, length, width, isStatic,
  frictionAir, mass, restitution, sensor, rotation, priority, group
}: ColliderProps): Collider => {

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

  colliderDesc.setFriction(0)

  if (sensor) colliderDesc.setSensor(true)
  if (mass) colliderDesc.setMass(mass)
  if (restitution) colliderDesc.setRestitution(restitution)
  if (rotation) colliderDesc.setRotation(rotation)

  const bodyDesc = (isStatic) ? RigidBodyDesc.fixed() : RigidBodyDesc.dynamic()
  bodyDesc.setLinearDamping(frictionAir ?? 0)

  const collider: Collider = {
    type: "collider",
    colliderDesc: colliderDesc,
    rapierCollider: undefined,
    body: undefined,
    bodyDesc,
    sensor: sensor ?? (() => false),
    priority: priority ?? 0,
    hittable: hittable ?? false,
    setGroup: (group) => {
      const n = Number.parseInt(ColliderGroups[group], 2)
      if (n >= 0 && n <= 4294967295) {
        colliderDesc.setCollisionGroups(n)
      }
    }
  }

  collider.setGroup(group ? group : "default")

  return collider
}
