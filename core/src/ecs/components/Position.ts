import { Component, Entity, Oct, OctString, SystemBuilder, XY, min, reduce, round, toOctString } from "@piggo-gg/core"

export type Position = Component<"position", {
  x: number
  y: number
  velocity: XY
  speed: number
  rotation: number
  pointing: Oct
  pointingDelta: XY
  heading: XY
  velocityResets: number
  follows: string | undefined
  offset: XY
  standing: boolean
  gravity: number
  friction: number
}> & {
  lastCollided: number
  screenFixed: boolean
  orientation: OctString
  orientationRads: number
  setPosition: (_: XY) => Position
  setVelocity: (_: { x?: number, y?: number }) => Position
  impulse: (_: XY) => Position
  setSpeed: (_: number) => void
  setHeading: (_: XY) => Position
  clearHeading: () => Position
  updateOrientation: () => Position
  updateVelocity: () => Position
  rotateUp: (_: number, stopAtZero?: boolean) => Position
  rotateDown: (_: number, stopAtZero?: boolean) => Position
}

export type PositionProps = {
  x?: number
  y?: number
  velocity?: XY
  gravity?: number
  friction?: number
  speed?: number
  velocityResets?: number
  screenFixed?: boolean
  follows?: string
}

// the entity's position in the world
export const Position = (props: PositionProps = {}): Position => {
  const position: Position = {
    type: "position",
    data: {
      x: props.x ?? 0,
      y: props.y ?? 0,
      velocity: props.velocity ?? { x: 0, y: 0 },
      speed: props.speed ?? 0,
      rotation: 0,
      pointing: 0,
      pointingDelta: { x: NaN, y: NaN },
      heading: { x: NaN, y: NaN },
      velocityResets: props.velocityResets ?? 0,
      follows: props.follows ?? undefined,
      offset: { x: 0, y: 0 },
      standing: false,
      friction: props.friction ?? 0,
      gravity: props.gravity ?? 0
    },
    lastCollided: 0,
    screenFixed: props.screenFixed ?? false,
    orientation: "r",
    orientationRads: 0,
    setPosition: ({ x, y }: XY) => {
      position.data.x = x
      position.data.y = y
      return position
    },
    setVelocity: ({ x, y }) => {
      if (x !== undefined) position.data.velocity.x = round(x * 100) / 100
      if (y !== undefined) position.data.velocity.y = round(y * 100) / 100

      return position.updateOrientation()
    },
    impulse: ({ x, y }: XY) => {
      return position.setVelocity({
        x: position.data.velocity.x + x,
        y: position.data.velocity.y + y
      })
    },
    setSpeed: (speed: number) => {
      position.data.speed = speed
    },
    setHeading: (xy: XY) => {
      position.data.heading = xy
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
    rotateUp: (amount: number, stopAtZero: boolean = false) => {
      position.data.rotation += amount

      if (stopAtZero) {
        if (position.data.rotation > 0 && position.data.rotation - amount < 0) {
          position.data.rotation = 0
        }
      }

      return position
    },
    rotateDown: (amount: number, stopAtZero: boolean = false) => {
      position.data.rotation -= amount

      if (stopAtZero) {
        if (position.data.rotation < 0 && position.data.rotation + amount > 0) {
          position.data.rotation = 0
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
    query: ["position", "actions"],
    onTick: (entities: Entity<Position>[]) => {
      entities.forEach(entity => {

        const { position } = entity.components

        if (position.data.gravity && world.currentGame.view === "side") {
          position.data.velocity.y = min(position.data.velocity.y + position.data.gravity, position.data.gravity * 45)
          position.updateOrientation()
        }

        if (position.data.friction && world.currentGame.view === "side") {
          position.data.velocity.x = reduce(position.data.velocity.x, position.data.friction)
        }

        if (position.data.follows) {
          const following = world.entities[position.data.follows]

          if (following && following.components.position) {
            const { x, y, velocity, pointing, pointingDelta, speed } = following.components.position.data

            position.data = {
              ...position.data,
              x: x + position.data.offset.x,
              y: y + position.data.offset.y,
              pointing,
              speed,
              velocity: { ...velocity },
              pointingDelta: { ...pointingDelta },
            }

            position.lastCollided = following.components.position.lastCollided
          }
        }
      })
    }
  })
}
