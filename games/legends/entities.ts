import { Entity, Position, Renderable, mapIsometric } from "@piggo-gg/core";
import { Graphics } from "pixi.js";

const add = (arr1: number[], arr2: number[]): [number, number] => {
  return [arr1[0] + arr2[0], arr1[1] + arr2[1]];
}

export const Rift = (wallPoints: number[]) => Entity({
  id: "rift",
  components: {
    position: new Position({ x: 0, y: 0 }),
    renderable: new Renderable({
      setup: async (r) => {

        const top = [0, 0];
        const right = [2500, 0];
        const bottom = [2500, 2500];
        const left = [0, 2500];

        // grass
        const grass = new Graphics();
        grass.setStrokeStyle({ width: 2, color: 0xffffff, alpha: 1 });
        grass.poly(wallPoints);
        grass.fill(0x008833);

        // top right
        const lanes = new Graphics();
        lanes.poly(mapIsometric([
          add(top, [200, 1]),
          add(top, [200, 200]),
          add(right, [-200, 200]),
          add(right, [-200, 1]),
        ]))

        // top left
        lanes.poly(mapIsometric([
          add(top, [1, 200]),
          add(top, [200, 200]),

          add(left, [200, -200]),
          add(left, [1, -200]),
        ]));

        // bot right
        lanes.poly(mapIsometric([
          add(bottom, [-200, -200]),
          add(bottom, [-1, -200]),
          add(right, [-1, 200]),
          add(right, [-200, 200]),
        ]));

        // bot left
        lanes.poly(mapIsometric([
          add(left, [200, -200]),
          add(left, [200, -1]),
          add(bottom, [-200, -1]),
          add(bottom, [-200, -200]),
        ]));

        // mid
        lanes.poly(mapIsometric([
          add(right, [-400, 200]),
          add(right, [-200, 400]),
          add(left, [400, -200]),
          add(left, [200, -400]),
        ]));

        lanes.fill(0xf7c860);

        const spawns = new Graphics();

        // purple spawn
        spawns.poly(mapIsometric([
          right,
          add(right, [-600, 0]),
          add(right, [-600, 400]),
          add(right, [-400, 600]),
          add(right, [0, 600]),
        ]));

        // blue spawn
        spawns.poly(mapIsometric([
          left,
          add(left, [0, -600]),
          add(left, [400, -600]),
          add(left, [600, -400]),
          add(left, [600, 0]),
        ]));

        spawns.fill(0xaa00ff);

        r.c.addChild(grass, lanes, spawns);
      },
    })
  }
});
