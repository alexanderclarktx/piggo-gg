import {
  Component, Entity, Oct, OctString, SystemBuilder, World, XY, XYZ, max, min, reduce, round, toOctString
} from "@piggo-gg/core"

export type Position = Component<"position", {
  x: number
  y: number
  z: number
  follows: string | undefined
  friction: number
  gravity: number
  heading: XY
  offset: XY
  pointing: Oct
  pointingDelta: XY
  rotation: number
  speed: number
  standing: boolean
  stop: number | undefined
  velocity: XYZ
  velocityResets: number
}> & {
  lastCollided: number
  screenFixed: boolean
  orientation: OctString
  orientationRads: number
  setGravity: (_: number) => Position
  setPosition: (_: { x?: number, y?: number, z?: number }) => Position
  setRotation: (_: number) => Position
  setVelocity: (_: { x?: number, y?: number, z?: number }) => Position
  impulse: (_: XY) => Position
  interpolate: (_: number, __: World) => XYZ
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
  friction?: number
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
      follows: props.follows ?? undefined,
      friction: props.friction ?? 0,
      gravity: props.gravity ?? 0,
      heading: { x: NaN, y: NaN },
      offset: props.offset ?? { x: 0, y: 0 },
      pointing: 0,
      pointingDelta: { x: NaN, y: NaN },
      rotation: props.rotation ?? 0,
      speed: props.speed ?? 0,
      standing: true,
      stop: undefined,
      velocity: props.velocity ? { ...props.velocity, z: 0 } : { x: 0, y: 0, z: 0 },
      velocityResets: props.velocityResets ?? 0
    },
    lastCollided: 0,
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
    impulse: ({ x, y }: XY) => {
      return position.setVelocity({
        x: position.data.velocity.x + x,
        y: position.data.velocity.y + y
      })
    },
    interpolate: (delta: number, world: World) => {
      let z = position.data.velocity.z * delta / world.tickrate
      if (position.data.stop && position.data.z + z < position.data.stop) {
        // z = max(z, position.data.stop)
        z = position.data.stop - position.data.z
      }

      if (world.tick - position.lastCollided <= 4) {
        return { x: 0, y: 0, z }
      }

      return {
        x: position.data.velocity.x * delta / 1000,
        y: position.data.velocity.y * delta / 1000,
        z
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
    priority: 8,
    onTick: (entities: Entity<Position>[]) => {
      entities.forEach(entity => {

        const { position } = entity.components

        // gravity & z
        if (position.data.velocity.z || position.data.z) {
          position.data.z = max(position.data.z + position.data.velocity.z, position.data.stop ?? 0)

          if (position.data.stop && position.data.z === position.data.stop) {
            position.data.velocity.z = 0
            position.data.gravity = 0
            position.data.standing = true

            position.data.stop = undefined
          } else {
            position.data.standing = false
          }

          if (position.data.z > 0) {
            position.data.velocity.z -= position.data.gravity
          }
        }

        // side-view gravity
        if (position.data.gravity && world.game.view === "side") {
          position.data.velocity.y = min(position.data.velocity.y + position.data.gravity, position.data.gravity * 45)
          position.updateOrientation()
        }

        // side-view air resistance
        if (position.data.friction && world.game.view === "side") {
          position.data.velocity.x = reduce(position.data.velocity.x, position.data.friction)
        }

        // follows
        if (position.data.follows) {
          const target = world.entities[position.data.follows]

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
          }
        }
      })
    }
  })
}
