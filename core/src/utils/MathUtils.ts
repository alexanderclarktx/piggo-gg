import { Clickable, Entity, Position, Renderer } from "@piggo-gg/core";

export type XY = { x: number, y: number };

export const equalsXY = (a: XY, b: XY) => a.x === b.x && a.y === b.y;

export const orthoToDirection = (o: number) => {
  if (o === 0) return "l";
  if (o === 1) return "ul";
  if (o === 2) return "u";
  if (o === 3) return "ur";
  if (o === 4) return "r";
  if (o === 5) return "dr";
  if (o === 6) return "d";
  if (o === 7) return "dl";
  return "d";
}

export const setsEqual = <T>(xs: Set<T>, ys: Set<T>) => {
  return xs.size === ys.size && [...xs].every((x) => ys.has(x));
}

export const addPoints = (arr1: [number, number] | number[], arr2: [number, number]): [number, number] => {
  return [arr1[0] + arr2[0], arr1[1] + arr2[1]];
}

export const worldToIsometric = ({ x, y }: XY): XY => ({
  x: x - y,
  y: (x + y) / 2
});

export const isometricToWorld = ({ x, y }: XY): XY => ({
  x: (2 * y + x) / 2,
  y: (2 * y - x) / 2
});

export const pointsIsometric = (points: number[][]) => points.map(([x, y]) => worldToIsometric({ x, y })).map(({ x, y }) => [x, y]).flat();

export const closestEntity = (entities: Entity<Position>[], pos: XY): Entity<Position> | undefined => {
  if (entities.length > 1) {
    entities.sort((a: Entity<Position>, b: Entity<Position>) => {
      const aPosition = a.components.position;
      const bPosition = b.components.position;
      const dx = aPosition.data.x - pos.x;
      const dy = aPosition.data.y - pos.y;
      const da = dx * dx + dy * dy;
      const dx2 = bPosition.data.x - pos.x;
      const dy2 = bPosition.data.y - pos.y;
      const db = dx2 * dx2 + dy2 * dy2;
      return da - db;
    });
  }
  return entities[0];
}

export const normalize = ({ x, y, entity }: { x: number, y: number, entity: Entity<Position> }): XY => {
  const { speed } = entity.components.position.data;

  if (x === 0) return { x, y: Math.sign(y) * speed };
  if (y === 0) return { x: Math.sign(x) * speed, y };

  const ratio = x * x / (y * y);

  const newX = Math.sqrt(speed * speed / (1 + ratio)) * Math.sign(x);
  const newY = Math.sqrt(speed * speed / (1 + 1 / ratio)) * Math.sign(y);

  return { x: newX, y: newY };
}

export const checkBounds = (renderer: Renderer, position: Position, clickable: Clickable, click: XY, clickWorld: XY): boolean => {

  let { x, y } = position.data;
  if (clickable.anchor) {
    x -= clickable.width * clickable.anchor.x;
    y -= clickable.height * clickable.anchor.y;
  }
  let bounds = { x, y, w: clickable.width, h: clickable.height };

  if (position.screenFixed && position.data.x < 0) {
    bounds.x = position.data.x + renderer.props.canvas.width;
  }
  if (position.screenFixed && position.data.y < 0) {
    bounds.y = position.data.y + renderer.props.canvas.height;
  }

  let clicked = false;
  position.screenFixed ? clicked = (
    click.x >= bounds.x && click.x <= bounds.x + bounds.w &&
    click.y >= bounds.y && click.y <= bounds.y + bounds.h
  ) : clicked = (
    clickWorld.x >= bounds.x && clickWorld.x <= bounds.x + bounds.w &&
    clickWorld.y >= bounds.y && clickWorld.y <= bounds.y + bounds.h
  )

  return clicked;
}

export const randomColor = () => Math.random() * 0xffffff;
