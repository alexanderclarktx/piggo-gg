import { Entity, EntityProps } from "@piggo-legends/core";
import { Tile } from "./Tile";

function listComprehension<T>(list: T[], callback: (item: T) => boolean): T[] {
  return list.filter(callback).map((item) => item)
}

export type BoardProps = EntityProps & {
  tiles: Tile[][];
}

export class Board extends Entity<BoardProps> {
  tiles: Tile[][];

  constructor(props: BoardProps) {
    super(props);
    // let tiles = [];
    // for (let i = 0; i < widthHeight; i++) {
    //   tiles.push([]);
    //   for (let j = 0; j < widthHeight; j++) {
    //     tiles[i].push(new Tile());
    //   }
    // }
  }
}
