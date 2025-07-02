import {
  Component, Entity, Oct, OctString, SystemBuilder,
  World, XY, XYZ, abs, max, min, round, toOctString
} from "@piggo-gg/core"

export type Position = Component<"position", {
  x: number
  y: number
  z: number
  aim: XY
  facing: -1 | 1
  follows: string | undefined
  friction: boolean
  gravity: number
  heading: XY
  offset: XY
  pointing: Oct
  pointingDelta: XY
  rotation: number
  speed: number
  standing: boolean
  stop: number
  velocity: XYZ
  velocityResets: number
}> & {
  lastCollided: number
  localVelocity: XYZ
  screenFixed: boolean
  orientation: OctString
  orientationRads: number
  setGravity: (_: number) => Position
  setPosition: (_: { x?: number, y?: number, z?: number }) => Position
  setRotation: (_: number) => Position
  setVelocity: (_: { x?: number, y?: number, z?: number }) => Position
  scaleVelocity: (factor: number) => Position
  moveAim: (_: XY) => Position
  impulse: (_: { x?: number, y?: number, z?: number }) => Position
  interpolate: (world: World) => XYZ
  setSpeed: (_: number) => void
  setHeading: (_: XY) => Position
  clearHeading: () => Position
  updateOrientation: () => Position
  updateVelocity: () => Position
  rotate: (_: number, stopAtZero?: boolean) => Position
}

export type PositionProps = {
  x?: number
  y?: number
  z?: number
  velocity?: { x: number, y: number }
  gravity?: number
  friction?: boolean
  stop?: number
  speed?: number
  velocityResets?: number
  screenFixed?: boolean
  follows?: string
  offset?: XY
  rotation?: number
}

// the entity's position in the world
export const Position = (props: PositionProps = {}): Position => {
  const position: Position = {
    type: "position",
    data: {
      x: props.x ?? 0,
      y: props.y ?? 0,
      z: props.z ?? 0,
      facing: 1,
      follows: props.follows ?? undefined,
      friction: props.friction ?? false,
      gravity: props.gravity ?? 0,
      heading: { x: NaN, y: NaN },
      aim: { x: 0, y: 0 },
      offset: props.offset ?? { x: 0, y: 0 },
      pointing: 0,
      pointingDelta: { x: NaN, y: NaN },
      rotation: props.rotation ?? 0,
      speed: props.speed ?? 0,
      standing: true,
      stop: props.stop ?? 0,
      velocity: props.velocity ? { ...props.velocity, z: 0 } : { x: 0, y: 0, z: 0 },
      velocityResets: props.velocityResets ?? 0
    },
    lastCollided: 0,
    localVelocity: { x: 0, y: 0, z: 0 },
    screenFixed: props.screenFixed ?? false,
    orientation: "r",
    orientationRads: 0,
    setGravity: (gravity: number) => {
      position.data.gravity = round(gravity, 3)
      return position
    },
    setPosition: ({ x, y, z }: XYZ) => {
      if (x !== undefined) position.data.x = round(x, 3)
      if (y !== undefined) position.data.y = round(y, 3)
      if (z !== undefined) position.data.z = round(z, 3)

      return position
    },
    setRotation: (rotation: number) => {
      position.data.rotation = round(rotation, 3)
      return position
    },
    setVelocity: ({ x, y, z }) => {
      if (x !== undefined) position.data.velocity.x = round(x * 100) / 100
      if (y !== undefined) position.data.velocity.y = round(y * 100) / 100
      if (z !== undefined) position.data.velocity.z = round(z * 100) / 100

      return position.updateOrientation()
    },
    scaleVelocity: (factor: number) => {
      position.data.velocity.x *= factor
      position.data.velocity.y *= factor

      if (abs(position.data.velocity.x) < 0.02) position.data.velocity.x = 0
      if (abs(position.data.velocity.y) < 0.02) position.data.velocity.y = 0

      return position
    },
    moveAim: ({ x, y }: XY) => {
      position.data.aim.x = round(position.data.aim.x - x, 3)
      position.data.aim.y = round(position.data.aim.y - y, 3)

      position.data.aim.y = max(-1.5, min(1.5, position.data.aim.y))
      return position
    },
    impulse: ({ x, y, z }: XYZ) => {
      if (x !== undefined) position.data.velocity.x += x
      if (y !== undefined) position.data.velocity.y += y
      if (z !== undefined) position.data.velocity.z += z
      return position
    },
    interpolate: (world: World) => {
      const delta = performance.now() - world.time

      let dz = position.data.velocity.z * delta / world.tickrate
      if (position.data.stop < position.data.z && position.data.z + dz < position.data.stop) {
        dz = position.data.stop - position.data.z
      }

      if (world.tick - position.lastCollided <= 4) {
        return { x: position.data.x, y: position.data.y, z: position.data.z + dz }
      }

      return {
        x: position.data.x + position.localVelocity.x * delta / 1000,
        y: position.data.y + position.localVelocity.y * delta / 1000,
        z: position.data.z + dz
      }
    },
    setSpeed: (speed: number) => {
      position.data.speed = speed
    },
    setHeading: (xy: XY) => {
      position.data.heading = {
        x: round(xy.x, 2),
        y: round(xy.y, 2)
      }
      return position
    },
    clearHeading: () => {
      position.data.heading = { x: NaN, y: NaN }
      return position
    },
    updateOrientation: () => {
      const { x, y } = position.data.velocity

      const rads = (Math.atan2(y, x) / Math.PI) * 4 + 4
      position.orientationRads = round(rads, 2)

      if (x || y) position.orientation = toOctString(round(rads) % 8 as Oct)

      return position
    },
    updateVelocity: () => {
      if (!position.data.heading.x || !position.data.heading.y) return position
      const dx = position.data.heading.x - position.data.x
      const dy = position.data.heading.y - position.data.y

      const angle = Math.atan2(dy, dx)
      const Vx = Math.cos(angle) * position.data.speed
      const Vy = Math.sin(angle) * position.data.speed

      position.setVelocity({ x: Vx, y: Vy })

      if (Vx > 0) position.data.facing = 1
      if (Vx < 0) position.data.facing = -1

      return position
    },
    rotate: (amount: number, stopAtZero: boolean = false) => {
      position.data.rotation += amount

      if (stopAtZero) {
        if (amount > 0) {
          if (position.data.rotation > 0 && position.data.rotation - amount < 0) {
            position.setRotation(0)
          }
        } else {
          if (position.data.rotation < 0 && position.data.rotation + amount > 0) {
            position.setRotation(0)
          }
        }
      }

      return position
    }
  }
  return position
}

export const PositionSystem: SystemBuilder<"PositionSystem"> = {
  id: "PositionSystem",
  init: (world) => ({
    id: "PositionSystem",
    query: ["position"],
    priority: 10,
    onTick: (entities: Entity<Position>[]) => {
      entities.forEach(entity => {

        const { position } = entity.components

        // gravity & z
        if (position.data.velocity.z || position.data.z) {

          // apply stop
          const wouldGo = position.data.z + position.data.velocity.z
          if (position.data.stop < position.data.z && wouldGo < position.data.stop) {
            position.data.z = position.data.stop
          } else {
            position.data.z = wouldGo
          }

          // set standing
          if (position.data.z === position.data.stop) {
            position.data.velocity.z = 0
            position.data.standing = true
          } else {
            position.data.standing = false
            position.data.velocity.z -= position.data.gravity
          }
        } else {
          position.data.standing = true
        }

        // velocity dampening
        if (position.data.friction) {
          entity.components.position.scaleVelocity(position.data.standing ? 0.8 : 0.98)
        }

        // side-view gravity
        if (position.data.gravity && world.game.view === "side") {
          position.data.velocity.y = min(position.data.velocity.y + position.data.gravity, position.data.gravity * 45)
          position.updateOrientation()
        }

        // follows
        if (position.data.follows) {
          const target = world.entity(position.data.follows)

          if (target && target.components.position) {
            const { x, y, z, velocity, pointing, pointingDelta, speed, stop } = target.components.position.data

            position.data = {
              ...position.data,
              pointing,
              pointingDelta: { ...pointingDelta },
              speed,
              stop,
              velocity: { ...velocity },
              x: x + position.data.offset.x,
              y: y + position.data.offset.y,
              z: z
            }

            position.lastCollided = target.components.position.lastCollided
            position.localVelocity = { ...target.components.position.localVelocity }
          }
        }
      })
    }
  })
}
