import { Action, LineWall, XY, abs, min, playSound, round, sign } from "@piggo-gg/core";

export const IceWall = Action<XY>(({ world, params, entity }) => {
  if (!entity || !entity.components.position) return;

  const width = 50;

  const { x: mouseX, y: mouseY } = params;
  const { x, y } = entity.components.position.data;

  // distance to mouse
  const dx = abs(mouseX - x);
  const dy = abs(mouseY - y);

  // sign
  const sx = sign(mouseX - x);
  const sy = sign(mouseY - y);

  // flip X axis
  const flip = sx === sy ? -1 : 1;

  // ratios
  const rx = dx / (dx + dy)
  const ry = dy / (dx + dy)

  const coords = [
    mouseX - flip * min(width, (width * ry)), mouseY - min(width, (width * rx)),
    mouseX + flip * min(width, (width * ry)), mouseY + min(width, (width * rx))
  ].map(round);

  world.addEntity(LineWall({ points: coords, visible: true, health: 30, shootable: false }));

  playSound([world.client?.sounds["wallPlace1"], world.client?.sounds["wallPlace2"]]);

}, 100);