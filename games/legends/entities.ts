import { Entity, Position, Renderable, worldToScreen } from "@piggo-gg/core";
import { WallPoints } from "@piggo-gg/games";
import { Graphics } from "pixi.js";

const add = (arr1: number[], arr2: number[]): [number, number] => {
  return [arr1[0] + arr2[0], arr1[1] + arr2[1]];
}

export const Rift = (wallPoints: WallPoints) => Entity({
  id: "rift",
  components: {
    position: new Position({ x: 0, y: 0 }),
    renderable: new Renderable({
      setup: async (r) => {

        const wallPointsWorld = wallPoints.map(([x, y]) => worldToScreen({ x, y })).map(({ x, y }) => [x, y]);

        const top = [0, 0];
        const right = [2500, 0];
        const bottom = [2500, 2500];
        const left = [0, 2500];

        // grass
        const grass = new Graphics();
        grass.setStrokeStyle({ width: 2, color: 0xffffff, alpha: 1 });
        grass.poly(wallPointsWorld.flat());
        grass.fill(0x008833);

        // top right
        const lanes = new Graphics();
        lanes.poly([
          add(top, [200, 1]),
          add(top, [200, 200]),
          add(right, [-200, 200]),
          add(right, [-200, 1]),
        ].map(([x, y]) => worldToScreen({ x, y })).map(({ x, y }) => [x, y]).flat());

        // top left
        lanes.poly([
          add(top, [1, 200]),
          add(top, [200, 200]),

          add(left, [200, -200]),
          add(left, [1, -200]),
        ].map(([x, y]) => worldToScreen({ x, y })).map(({ x, y }) => [x, y]).flat());

        // bot right
        lanes.poly([
          add(bottom, [-200, -200]),
          add(bottom, [-1, -200]),
          add(right, [-1, 200]),
          add(right, [-200, 200]),
        ].map(([x, y]) => worldToScreen({ x, y })).map(({ x, y }) => [x, y]).flat());

        // bot left
        lanes.poly([
          add(left, [200, -200]),
          add(left, [200, -1]),
          add(bottom, [-200, -1]),
          add(bottom, [-200, -200]),
        ].map(([x, y]) => worldToScreen({ x, y })).map(({ x, y }) => [x, y]).flat());

        // mid
        lanes.poly([
          add(right, [-400, 200]),
          add(right, [-200, 400]),
          add(left, [400, -200]),
          add(left, [200, -400]),
        ].map(([x, y]) => worldToScreen({ x, y })).map(({ x, y }) => [x, y]).flat());

        lanes.fill(0xf7c860);

        const spawns = new Graphics();

        // purple spawn
        spawns.poly([
          right,
          add(right, [-600, 0]),
          add(right, [-600, 400]),
          add(right, [-400, 600]),
          add(right, [0, 600]),
        ].map(([x, y]) => worldToScreen({ x, y })).map(({ x, y }) => [x, y]).flat());

        // blue spawn
        spawns.poly([
          left,
          add(left, [0, -600]),
          add(left, [400, -600]),
          add(left, [600, -400]),
          add(left, [600, 0]),
        ].map(([x, y]) => worldToScreen({ x, y })).map(({ x, y }) => [x, y]).flat());

        spawns.fill(0xaa00ff);

        r.c.addChild(grass);
        r.c.addChild(lanes);
        r.c.addChild(spawns);
      },
    })
  }
});
