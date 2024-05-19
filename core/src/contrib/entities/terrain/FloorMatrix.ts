import { Debug, Entity, Position, Renderable, XY } from "@piggo-gg/core";
import { Graphics, Matrix } from "pixi.js";

const width = 25;
let index = 0;

export type FloorMatrixProps = {
  rows: number
  cols: number
  position: XY
}

export const FloorMatrix = ({ rows, cols, position }: FloorMatrixProps): Entity => Entity({
  id: `floor-matrix-${index++}`,
  components: {
    debug: new Debug(),
    position: new Position(position),
    renderable: new Renderable({
      zIndex: 0,
      setChildren: async () => makeTileGrid(rows, cols)
    })
  }
});

const makeTileGrid = (cols: number, rows: number): Renderable[] => {
  const tiles: Renderable[] = [];

  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      const x = row * width * 1.5;
      const y = (row + col * 2) * width * 0.5 * 0.87;
      tiles.push(tile(x, y));
    }
  }
  return tiles;
}

const tile = (x: number, y: number): Renderable => new Renderable({
  position: { x, y },
  setup: async (r) => {
    const graphics = new Graphics({ roundPixels: false });

    // draw the tile
    graphics
      .transform(new Matrix(1, 0, 0, 0.5, 0, 0))
      .moveTo(width, 0)
      .lineTo(0.5 * width, 0.87 * width)
      .lineTo(-0.5 * width, 0.87 * width)
      .lineTo(-width, 0)
      .lineTo(-0.5 * width, -0.87 * width)
      .lineTo(0.5 * width, -0.87 * width)
      .lineTo(width, 0)
      .fill({ color: 0x7777aa, alpha: 0.9 })
      .stroke({ width: 1, color: 0x000000 });

    r.c.addChild(graphics);
  }
});
