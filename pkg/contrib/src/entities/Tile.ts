import { Entity, EntityProps } from "@piggo-legends/core";

export type TileProps = EntityProps & {
  // unit: Unit,
  x: number,
  y: number
}

export class Tile extends Entity<TileProps> {
  constructor(props: TileProps) {
    super(props);
  }
}
