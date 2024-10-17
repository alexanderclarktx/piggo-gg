import { Component, Entity, SystemBuilder, XY, orthoToDirection, round } from "@piggo-gg/core";

export type Position = Component<"position", {
  x: number
  y: number
  velocity: XY
  speed: number
  rotation: number
  pointing: number
  pointingDelta: XY
  heading: XY
  velocityResets: number
  follows: string | undefined
}> & {
  lastCollided: number
  screenFixed: boolean
  orientation: "u" | "ur" | "r" | "dr" | "d" | "dl" | "l" | "ul"
  orientationRads: number
  setPosition: (_: XY) => Position
  setVelocity: (_: XY) => Position
  setSpeed: (_: number) => void
  setHeading: (_: XY) => Position
  clearHeading: () => Position
  updateVelocity: () => Position
  rotateUp: (_: number, stopAtZero?: boolean) => Position
  rotateDown: (_: number, stopAtZero?: boolean) => Position
}

export type PositionProps = {
  x?: number
  y?: number
  velocity?: XY
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
      follows: props.follows ?? undefined
    },
    orientation: "r",
    orientationRads: 0,
    lastCollided: 0,
    screenFixed: props.screenFixed ?? false,
    setPosition: ({ x, y }: XY) => {
      position.data.x = x;
      position.data.y = y;
      return position;
    },
    setVelocity: ({ x, y }: XY) => {
      position.data.velocity.x = round(x * 100) / 100;
      position.data.velocity.y = round(y * 100) / 100;

      const rads = (Math.atan2(y, x) / Math.PI) * 4 + 4;
      position.orientationRads = round(rads, 2);

      if (x || y) position.orientation = orthoToDirection(round(rads) % 8);

      return position;
    },
    setSpeed: (speed: number) => {
      position.data.speed = speed;
    },
    setHeading: (xy: XY) => {
      position.data.heading = xy;
      return position;
    },
    clearHeading: () => {
      position.data.heading = { x: NaN, y: NaN };
      return position;
    },
    updateVelocity: () => {
      if (!position.data.heading.x || !position.data.heading.y) return position;
      const dx = position.data.heading.x - position.data.x;
      const dy = position.data.heading.y - position.data.y;

      const angle = Math.atan2(dy, dx);
      const Vx = Math.cos(angle) * position.data.speed;
      const Vy = Math.sin(angle) * position.data.speed;

      position.setVelocity({ x: Vx, y: Vy });

      return position;
    },
    rotateUp: (amount: number, stopAtZero: boolean = false) => {
      position.data.rotation += amount;

      if (stopAtZero) {
        if (position.data.rotation > 0 && position.data.rotation - amount < 0) {
          position.data.rotation = 0;
        }
      }

      return position;
    },
    rotateDown: (amount: number, stopAtZero: boolean = false) => {
      position.data.rotation -= amount;

      if (stopAtZero) {
        if (position.data.rotation < 0 && position.data.rotation + amount > 0) {
          position.data.rotation = 0;
        }
      }

      return position;
    }
  }
  return position;
}

export const PositionSystem: SystemBuilder<"PositionSystem"> = {
  id: "PositionSystem",
  init: (world) => ({
    id: "PositionSystem",
    query: ["position"],
    onRender: (entities: Entity<Position>[]) => {
      entities.forEach(entity => {

        const { position } = entity.components;

        if (position.data.follows) {
          const following = world.entities[position.data.follows]

          if (following && following.components.position) {
            const { x, y, velocity, pointing, pointingDelta, speed } = following.components.position.data;
            position.data = { ...position.data, x, y, velocity, pointing, pointingDelta, speed }
            // position.data = {
            //   ...position.data,
            //   x, y,
            //   velocity: { ...velocity },
            //   pointing,
            //   pointingDelta: { ...pointingDelta },
            //   speed
            // }
          }
        }
      })
    }
  })
}
