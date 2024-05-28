import { Action, LineWall, XY } from "@piggo-gg/core";

export const Wall = Action<{ mouse: XY }>(({ world, params, entity }) => {
  if (!entity || !entity.components.position) return;

  const width = 50;

  const { x: mouseX, y: mouseY } = params.mouse;
  const { x, y } = entity.components.position.data;

  // distance to mouse
  const dx = Math.abs(mouseX - x);
  const dy = Math.abs(mouseY - y);

  // sign
  const sx = Math.sign(mouseX - x);
  const sy = Math.sign(mouseY - y);

  // flip X axis
  const flip = sx === sy ? -1 : 1;

  // ratios
  const rx = dx / (dx + dy)
  const ry = dy / (dx + dy)

  const coords = [
    mouseX - flip * Math.min(width, (width * ry)), mouseY - Math.min(width, (width * rx)),
    mouseX + flip * Math.min(width, (width * ry)), mouseY + Math.min(width, (width * rx))
  ].map(Math.round);

  world.addEntity(LineWall({ points: coords, visible: true, health: 75, shootable: true }));
}, 100);
