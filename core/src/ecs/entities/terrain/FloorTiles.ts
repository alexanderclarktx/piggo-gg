import { Collider, Entity, LineWall, Position, Renderable, Renderer, TeamColors, XY, equalsXY, randomColor } from "@piggo-gg/core";
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

export const FloorTiles = ({ color, tint, rows, cols, position = { x: 0, y: 0 }, id = `floor${index++}` }: FloorTilesProps): Entity => Entity({
  id: id,
  components: {
    position: Position(position),
    renderable: Renderable({
      zIndex: 0 + index * 0.01,
      setChildren: async (r: Renderer) => {

        // draw the square
        const square = new Graphics()
          .transform(new Matrix(1, 0, 0, 1, 0, 16))
          .poly(tileCoordinates)
          .fill({ color: color ?? 0x7777aa, alpha: 1 })
          .stroke({ width: 1, color: 0x000000 });

        // create a render texture
        const renderTexture = RenderTexture.create({ width, height, resolution: window.devicePixelRatio });
        r.app.renderer.render({ container: square, target: renderTexture });

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

export const FloorTilesArray = (dim: number, tileArray: number[]): Entity => Entity({
  id: "floorTilesArray",
  components: {
    position: Position(),
    renderable: Renderable({
      zIndex: 0 + index * 0.01,
      setContainer: async (r: Renderer) => {

        // draw the square
        const square = new Graphics()
          .transform(new Matrix(1, 0, 0, 1, 0, 16))
          .poly(tileCoordinates)
          .fill({ color: 0xffffff, alpha: 1 })
          .stroke({ width: 1, color: 0x000000 });

        // create a render texture
        const texture = RenderTexture.create({ width, height, resolution: window.devicePixelRatio });
        r.app.renderer.render({ container: square, target: texture });

        const c = new Container();

        // create the tiles
        for (let x = 0; x < dim; x++) {
          for (let y = 0; y < dim; y++) {

            const value = tileArray[x * dim + y];
            let tint = 0x7777aa;

            if (value === 0 || value === 10) continue;

            if (value === 37) tint = TeamColors[1];
            if (value === 64) tint = TeamColors[2];
            if (value === 19) tint = 0xffccaa;

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

export const FloorCollidersArray = (dim: number, tileArray: number[]): Entity[] => {

  const width = 64;
  const height = 32;

  let coords: number[][] = [];

  const entities: Entity[] = [];
  for (let x = 0; x < dim; x++) {
    for (let y = 0; y < dim; y++) {

      const value = tileArray[x * dim + y];
      if (value !== 0) continue;

      const value9 = tileArray[x * dim + y + 1];
      const value5 = tileArray[x * dim + y - 1];
      const value7 = tileArray[(x - 1) * dim + y];
      const value1 = tileArray[(x + 1) * dim + y];

      const pos = { x: y * width / 2 - (x * width / 2), y: (y + x) * height / 2 + 16 };

      if (value5) {
        const points = [width / 2, -height / 2, 0, 0];
        // const points = [0, 0, width / 2, -height / 2];
        coords.push(points.map((p, i) => i % 2 === 0 ? p + pos.x : p + pos.y));
        const entity = Entity({
          id: `floorCollider-${x}-${y}-v5`,
          components: {
            position: Position(pos),
            collider: Collider({ shape: "line", isStatic: true, points })
          }
        });
        // entities.push(entity);
      }
      if (value9) {
        // const points = [width / 2, height / 2, width, 0];
        const points = [width, 0, width / 2, height / 2];
        coords.push(points.map((p, i) => i % 2 === 0 ? p + pos.x : p + pos.y));
        const entity = Entity({
          id: `floorCollider-${x}-${y}-v9`,
          components: {
            position: Position(pos),
            collider: Collider({ shape: "line", isStatic: true, points })
          }
        });
        // entities.push(entity);
      }
      if (value1) {
        const points = [0, 0, width / 2, height / 2];
        // const points = [width / 2, height / 2, 0, 0];
        coords.push(points.map((p, i) => i % 2 === 0 ? p + pos.x : p + pos.y));
        const entity = Entity({
          id: `floorCollider-${x}-${y}-v1`,
          components: {
            position: Position(pos),
            collider: Collider({ shape: "line", isStatic: true, points })
          }
        });
        // entities.push(entity);
      }
      if (value7) {
        // const points = [width, 0, width / 2, -height / 2];
        const points = [width / 2, -height / 2, width, 0];
        coords.push(points.map((p, i) => i % 2 === 0 ? p + pos.x : p + pos.y));
        const entity = Entity({
          id: `floorCollider-${x}-${y}-v7`,
          components: {
            position: Position(pos),
            collider: Collider({ shape: "line", isStatic: true, points })
          }
        });
        // entities.push(entity);
      }


      // entities.push(Entity({
      //   id: `floorCollider-${x}-${y}=zzz`,
      //   components: {
      //     position: Position(pos),
      //     collider: Collider({ shape: "line", isStatic: true, points: [...newPoints].flat() })
      //   }
      // }));
    };
  }



  let lines: Set<[XY, XY]> = new Set();
  let perimeters: Set<number[]> = new Set();

  coords.forEach((c) => {
    lines.add([{ x: c[0], y: c[1] }, { x: c[2], y: c[3] }]);
  });



  /*
             .
         .       .
      <             >
         .       .
             .
  */

  const seenPoints: Set<XY> = new Set();

  // find all the perimeter lines
  for (const line of lines) {
    if (!seenPoints.has(line[0]) && !seenPoints.has(line[1])) {
      let perimeter: number[] = [line[0].x, line[0].y, line[1].x, line[1].y];

      seenPoints.add(line[0]);
      let cursor = line[1];

      for (const unseenLine of lines) {
        if (!equalsXY(unseenLine[0], line[0]) && seenPoints.has(unseenLine[0])) continue;
        if (equalsXY(cursor, unseenLine[0])) {
          perimeter.push(unseenLine[1].x, unseenLine[1].y);
          seenPoints.add(unseenLine[1]);
          cursor = unseenLine[1];
        } else if (equalsXY(cursor, unseenLine[1]) && !seenPoints.has(unseenLine[0])) {
          perimeter.push(unseenLine[0].x, unseenLine[0].y);
          seenPoints.add(unseenLine[0]);
          cursor = unseenLine[0];
        }
      }
      // if (perimeter.length > 6) {
      perimeters.add(perimeter);
      //   seenPoints.add(line[0]);
      // }
    }
  }

  let cornerPerimeters: number[][] = [];

  // remove unnecessary inner lines from each perimeter
  perimeters.forEach((p) => {
    // a corner is a point where the two lines share X or Y coordinates
    const pointz: [number, number][] = [];

    for (let i = 0; i < p.length; i += 2) {
      pointz.push([p[i], p[i + 1]]);
    }

    const corners: [number, number][] = [];

    for (let i = 0; i < pointz.length; i++) {
      const a = pointz[i];
      const b = pointz[(i + 1) % pointz.length];
      const c = pointz[(i + 2) % pointz.length];

      if (a[0] === c[0] || a[1] === c[1]) {
        corners.push(b);
      }
    }

    // connect the corners
    // let connectedCorners: number[] = [];
    // for (let i = 0; i < corners.length; i++) {
    //   connectedCorners.push(corners[i][0], corners[i][1]);
    //   connectedCorners.push(corners[(i + 1) % corners.length][0], corners[(i + 1) % corners.length][1]);
    // }

    cornerPerimeters.push(corners.flat());
  });

  console.log(perimeters);
  console.log(cornerPerimeters);

  // entities.push(Entity({
  //   id: `floorCollider-xd`,
  //   components: {
  //     position: Position(),
  //     collider: Collider({ shape: "line", isStatic: true, points: coords.flat() })
  //   }
  // }));

  perimeters.forEach((p) => {
    entities.push(LineWall({
      points: p,
      visible: true,
      color: randomColor()
    }));
    // entities.push(Entity({
    //   id: `floorCollider-${p.flat()}`,
    //   components: {
    //     position: Position(),
    //     collider: Collider({ shape: "line", isStatic: true, points: p })
    //   }
    // }));
  });


  // cornerPerimeters.forEach((p) => {
  //   if (!p.length) return;
  //   entities.push(Entity({
  //     id: `floorCollider-${p.flat()}`,
  //     components: {
  //       position: Position(),
  //       collider: Collider({ shape: "line", isStatic: true, points: p })
  //     }
  //   }));
  // });

  // console.log(coords);



  return entities;
}
