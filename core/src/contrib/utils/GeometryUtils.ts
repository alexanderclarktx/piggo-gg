import { Entity, Position } from "@piggo-gg/core";

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

export const getClosestEntity = (entities: Entity<Position>[], pos: { x: number, y: number }): Entity<Position> => {
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
