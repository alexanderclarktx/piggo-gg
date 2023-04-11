import { Entity, EntityProps } from "@piggo-legends/gamertc";

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
