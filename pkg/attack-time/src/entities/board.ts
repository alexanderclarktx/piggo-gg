import { Entity } from "@piggo-legends/gamertc";
import { Tile } from "./tile";

function listComprehension<T>(list: T[], callback: (item: T) => boolean): T[] {
  return list.filter(callback).map((item) => item)
}

export class Board extends Entity {
  tiles: Tile[][];

  constructor() {
    super();
    // let tiles = [];
    // for (let i = 0; i < widthHeight; i++) {
    //   tiles.push([]);
    //   for (let j = 0; j < widthHeight; j++) {
    //     tiles[i].push(new Tile());
    //   }
    // }
  }
}
