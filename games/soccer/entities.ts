import { Entity, LineWall, Position, Renderable, screenToWorld } from "@piggo-gg/core";
import { Graphics } from "pixi.js";

const wallPoints = [
  [-300, 200],
  [-390, 300], // notch
  [-400, 300],
  [-400, 400],
  [-390, 400], // notch
  [-300, 500],
  [400, 500],
  [490, 400], // notch
  [500, 400],
  [500, 300],
  [490, 300], // notch
  [400, 200],
  [-300, 200],
]

export const FieldWall = (): Entity => {
  const wallPointsWorld = wallPoints.map(([x, y]) => screenToWorld({ x, y })).map(({ x, y }) => [x, y]);

  return LineWall({ points: wallPointsWorld.flat() });
}

export const FieldGrass = (): Entity => ({
  id: "field",
  components: {
    position: new Position({ x: 0, y: 0 }),
    renderable: new Renderable({
      setup: async (r) => {

        const lines = new Graphics();
        lines.lineStyle(2, 0xffffff, 1);

        // center line
        lines.moveTo(50, 200);
        lines.lineTo(50, 500);

        // big circle
        lines.drawCircle(50, 350, 50);

        // little circle
        lines.drawCircle(49.5, 350, 2);

        // free kick line left
        lines.moveTo(-351, 258);
        lines.lineTo(-310, 258);
        lines.lineTo(-310, 442);
        lines.lineTo(-351, 442);

        // free kick line right
        lines.moveTo(452, 258);
        lines.lineTo(410, 258);
        lines.lineTo(410, 442);
        lines.lineTo(452, 442);

        // free kick semicircle left
        lines.moveTo(-310, 400);
        lines.quadraticCurveTo(-260, 350, -310, 300);

        // free kick semicircle right
        lines.moveTo(410, 300);
        lines.quadraticCurveTo(360, 350, 410, 400);

        const grass = new Graphics();

        grass.lineStyle(2, 0xffffff, 1);
        grass.beginFill(0x008833);
        grass.drawPolygon(wallPoints.flat());

        r.c.addChild(grass);
        r.c.addChild(lines);
      },
    })
  }
})
