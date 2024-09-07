import { Component, XY, orthoToDirection, round } from "@piggo-gg/core";

export type Position = Component<"position", {
  x: number
  y: number
  velocity: XY
  speed: number
  rotation: number
  pointing: number
  heading: XY
  velocityResets: number
}> & {
  lastCollided: number
  screenFixed: boolean
  orientation: "u" | "ur" | "r" | "dr" | "d" | "dl" | "l" | "ul"
  setPosition: (_: XY) => Position
  setVelocity: (_: XY) => Position
  setSpeed: (_: number) => void
  setHeading: (_: XY) => Position
  clearHeading: () => Position
  updateVelocity: () => Position
  rotateUp: (_: number) => Position
  rotateDown: (_: number) => Position
}

export type PositionProps = {
  x?: number
  y?: number
  velocity?: XY
  speed?: number
  velocityResets?: number
  screenFixed?: boolean
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
      heading: { x: 0, y: 0 },
      velocityResets: props.velocityResets ?? 0
    },
    orientation: "r",
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

      if (x || y) position.orientation = orthoToDirection(round((Math.atan2(y, x) / Math.PI) * 4 + 4) % 8);

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
    rotateUp: (amount: number) => {
      position.data.rotation += amount;
      return position;
    },
    rotateDown: (amount: number) => {
      position.data.rotation -= amount;
      return position;
    }
  }
  return position;
}
