import { Collider, Entity, Position, Renderable, Renderer, TeamColors, XY } from "@piggo-gg/core";
import { Container, Graphics, Matrix, RenderTexture, Sprite } from "pixi.js";

export type FloorTilesProps = {
  rows: number
  cols: number
  position?: XY
  id?: string
  tint?: number
  color?: number
}

let index = 0;

const width = 64;
const height = 32;
const tileCoordinates = [0, 0, width / 2, height / 2, width, 0, width / 2, -height / 2, 0, 0]

const tileGraphic = (): Graphics => new Graphics()
  .transform(new Matrix(1, 0, 0, 1, 0, 16))
  .poly(tileCoordinates)
  .fill({ color: 0x7777aa, alpha: 1 })
  .stroke({ width: 1, color: 0x000000 });

export const FloorTilesArray = (dim: number, tileMap: number[]): Entity => Entity({
  id: "floorTilesArray",
  components: {
    position: Position(),
    renderable: Renderable({
      zIndex: 0 + index * 0.01,
      cullable: true,
      setContainer: async (r: Renderer) => {

        // draw the tile
        const tile = tileGraphic();

        // create a render texture
        const texture = RenderTexture.create({ width, height, resolution: window.devicePixelRatio });
        r.app.renderer.render({ container: tile, target: texture });

        const c = new Container();

        // create the tiles
        for (let x = 0; x < dim; x++) {
          for (let y = 0; y < dim; y++) {

            const value = tileMap[x * dim + y];
            let tint = 0x7777aa;

            if (value === 0 || value === 10) continue;

            if (value === 37) tint = TeamColors[1];
            if (value === 64) tint = TeamColors[2];
            if (value === 19) tint = 0xccaa99;

            const child = new Sprite({ texture, tint });
            child.position.set(y * width / 2 - (x * width / 2), (y + x) * height / 2);

            c.addChild(child);
          }
        }
        return c;
      }
    })
  }
})

export const FloorCollidersArray = (dim: number, tileMap: number[]): Entity[] => {
  const entities: Entity[] = [];
  let coords: number[][] = [];

  for (let x = 0; x < dim; x++) {
    for (let y = 0; y < dim; y++) {

      const value = tileMap[x * dim + y];
      if (value !== 0) continue;

      const value9 = tileMap[x * dim + y + 1];
      const value5 = tileMap[x * dim + y - 1];
      const value7 = tileMap[(x - 1) * dim + y];
      const value1 = tileMap[(x + 1) * dim + y];

      const pos = { x: y * width / 2 - (x * width / 2), y: (y + x) * height / 2 + 16 };
      const adjustedPos = (p: number, i: number) => i % 2 === 0 ? p + pos.x : p + pos.y;

      if (value5) {
        const points = [width / 2, -height / 2, 0, 0];
        coords.push(points.map(adjustedPos));
      }

      if (value9) {
        const points = [width, 0, width / 2, height / 2];
        coords.push(points.map(adjustedPos));
      }

      if (value1) {
        const points = [0, 0, width / 2, height / 2];
        coords.push(points.map(adjustedPos));
      }

      if (value7) {
        const points = [width / 2, -height / 2, width, 0];
        coords.push(points.map(adjustedPos));
      }
    }
  }

  coords.forEach((points, i) => {
    entities.push(Entity({
      id: `floorCollider-${i}`,
      components: {
        position: Position(),
        collider: Collider({ shape: "line", isStatic: true, points })
      }
    }));
  });

  return entities;
}

// DEPRECATED
export const FloorTiles = ({ color, tint, rows, cols, position = { x: 0, y: 0 }, id = `floor${index++}` }: FloorTilesProps): Entity => Entity({
  id: id,
  components: {
    position: Position(position),
    renderable: Renderable({
      zIndex: 0 + index * 0.01,
      setChildren: async (r: Renderer) => {

        // draw the tile
        const tile = tileGraphic();

        // create a render texture
        const renderTexture = RenderTexture.create({ width, height, resolution: window.devicePixelRatio });
        r.app.renderer.render({ container: tile, target: renderTexture });

        // create the tiles
        let tiles: Renderable[] = [];
        for (let x = 0; x < rows; x++) {
          for (let y = 0; y < cols; y++) {
            tiles.push(Renderable({
              position: { x: y * width / 2 - (x * width / 2), y: (y + x) * height / 2 },
              color: tint ?? 0xffffff,
              setContainer: async () => new Sprite(renderTexture)
            }))
          }
        }
        return tiles;
      }
    })
  }
});
