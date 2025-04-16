import { Component, Entity, Position, World } from "@piggo-gg/core"
import { Collider as RapierCollider, ColliderDesc, RigidBody, RigidBodyDesc } from "@dimforge/rapier2d-compat"

export type ColliderShapes = "ball" | "cuboid" | "line"

export type SensorCallback = (e2: Entity<Position | Collider>, world: World) => boolean

export const ColliderGroups = {
  all:     "11111111111111111111111111111111",
  default: "11111111000000001111111100000000",
  none:    "00000000000000000000000000000000",
  notself: "01000000000000001000000000000000",
  "1":     "00000000000000010000000000000001",
  "2":     "00000000000000100000000000000010",
  "3":     "00000000000001000000000000000100",
  "4":     "00000000000010000000000000001000",
  "5":     "00000000000100000000000000010000",
  "6":     "00000000001000000000000000100000",
  "7":     "00000000010000000000000001000000",
  "8":     "00000000100000000000000010000000",
  "9":     "00000001000000000000000100000000"
} as const;

export type Collider = Component<"collider"> & {
  body: RigidBody | undefined
  bodyDesc: RigidBodyDesc
  colliderDesc: ColliderDesc
  cullable: boolean
  group: keyof typeof ColliderGroups
  hittable: boolean
  isStatic: boolean
  priority: number
  rapierCollider: RapierCollider | undefined
  sensor: SensorCallback
  type: "collider"
  setGroup: (group: keyof typeof ColliderGroups) => void
}

export type ColliderProps = {
  cullable?: boolean
  frictionAir?: number // TODO deprecated
  group?: keyof typeof ColliderGroups
  hittable?: boolean
  isStatic?: boolean
  length?: number
  mass?: number
  points?: number[]
  priority?: number
  radius?: number
  restitution?: number
  rotation?: number
  sensor?: SensorCallback
  shape: ColliderShapes
  width?: number
}

export const Collider = ({
  cullable, shape, hittable, points, radius, length, width, isStatic,
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

  const bodyDesc = isStatic ? RigidBodyDesc.fixed() : RigidBodyDesc.dynamic()
  bodyDesc.setLinearDamping(frictionAir ?? 0)

  const collider: Collider = {
    body: undefined,
    bodyDesc,
    colliderDesc: colliderDesc,
    cullable: cullable ?? false,
    group: group ?? "default",
    hittable: hittable ?? false,
    isStatic: isStatic ?? false,
    priority: priority ?? 0,
    rapierCollider: undefined,
    sensor: sensor ?? (() => false),
    type: "collider",
    setGroup: (group) => {
      const n = Number.parseInt(ColliderGroups[group], 2)
      if (n >= 0 && n <= 4294967295) {
        colliderDesc.setCollisionGroups(n)
        collider.group = group
      }
    }
  }

  collider.setGroup(group ? group : "default")

  return collider
}
