import { Clickable, Entity, Position, Renderer } from "@piggo-gg/core";
import { Container } from "pixi.js";

export type XY = { x: number, y: number };

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

export const colorAdd = (color: number, add: number): number => {
  const r = Math.min(255, ((color >> 16) & 0xff) + ((add >> 16) & 0xff));
  const g = Math.min(255, ((color >> 8) & 0xff) + ((add >> 8) & 0xff));
  const b = Math.min(255, (color & 0xff) + (add & 0xff));

  return (r << 16) + (g << 8) + b;
}

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

export const tileIndex = (n: number, tileMap: number[]): number => {
  let numZeros = 0;
  for (let i = 0; i < n; i++) {
    if (tileMap[i] === 0) numZeros++;
  }
  return n - numZeros;
}

export const searchVisibleTiles = (start: XY, floorTilesArray: Entity, tileMap: number[]): Set<Container> => {
  const visibleTilesContainers: Set<Container> = new Set();

  const directions: (XY & { plus?: number })[] = [
    { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 },
    { x: 0.1, y: 0.9 },
    { x: 0.2, y: 0.8 },
    { x: 0.3, y: 0.7, plus: 1 },
    { x: 0.4, y: 0.6, plus: 1 },
    { x: 0.45, y: 0.55, plus: 1 },
    { x: 0.5, y: 0.5, plus: 2 },
    { x: 0.55, y: 0.45, plus: 1 },
    { x: 0.6, y: 0.4, plus: 1 },
    { x: 0.7, y: 0.3, plus: 1 },
    { x: 0.8, y: 0.2 },
    { x: 0.9, y: 0.1 },
    { x: -0.1, y: 0.9 },
    { x: -0.2, y: 0.8 },
    { x: -0.3, y: 0.7, plus: 1 },
    { x: -0.4, y: 0.6, plus: 1 },
    { x: -0.45, y: 0.55, plus: 1 },
    { x: -0.5, y: 0.5, plus: 2 },
    { x: -0.55, y: 0.45, plus: 1 },
    { x: -0.6, y: 0.4, plus: 1 },
    { x: -0.7, y: 0.3, plus: 1 },
    { x: -0.8, y: 0.2 },
    { x: -0.9, y: 0.1 },
    { x: 0.1, y: -0.9 },
    { x: 0.2, y: -0.8 },
    { x: 0.3, y: -0.7, plus: 1 },
    { x: 0.4, y: -0.6, plus: 1 },
    { x: 0.45, y: -0.55, plus: 1 },
    { x: 0.5, y: -0.5, plus: 2 },
    { x: 0.55, y: -0.45, plus: 1 },
    { x: 0.6, y: -0.4, plus: 1 },
    { x: 0.7, y: -0.3, plus: 1 },
    { x: 0.8, y: -0.2 },
    { x: 0.9, y: -0.1 },
    { x: -0.1, y: -0.9 },
    { x: -0.2, y: -0.8 },
    { x: -0.3, y: -0.7, plus: 1 },
    { x: -0.4, y: -0.6, plus: 1 },
    { x: -0.45, y: -0.55, plus: 1 },
    { x: -0.5, y: -0.5, plus: 2 },
    { x: -0.55, y: -0.45, plus: 1 },
    { x: -0.6, y: -0.4, plus: 1 },
    { x: -0.7, y: -0.3, plus: 1 },
    { x: -0.8, y: -0.2 },
    { x: -0.9, y: -0.1 }
  ]

  const castRay = (direction: XY, maxDistance: number): void => {
    for (let i = 0; i < maxDistance; i++) {
      const x = Math.round(start.x + direction.x * i);
      const y = Math.round(start.y + direction.y * i);
  
      if (tileMap[x + (y * 80)] === 0) break;
  
      const index = tileIndex(x + (y * 80), tileMap);
      const tile = floorTilesArray.components.renderable?.c.children[index];
      if (!tile) continue;
      visibleTilesContainers.add(tile);
    }
  }

  directions.forEach(({ x, y, plus = 0 }) => {
    castRay({ x, y }, 15 + plus);
  });

  return visibleTilesContainers;
}
