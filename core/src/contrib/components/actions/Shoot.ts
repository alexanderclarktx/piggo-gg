import { Action, ActionMap, LineWall, Projectile } from "@piggo-gg/core";

export const Shoot: ActionMap<{ mouse: { x: number, y: number } }> = {
  Q: Action(({ world, params, entity }) => {
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
  }, 50),
  shoot: Action(({ world, params, entity }) => {

    if (!entity) return;

    const { gun, position } = entity.components;
    if (!gun || !position) return;

    if (world.clientPlayerId && gun.canShoot()) {
      gun.shoot();

      const { x, y } = position.data;
      const { speed } = gun;

      // distance to mouse
      let dx = params.mouse.x - x;
      let dy = params.mouse.y - y;

      // normalize
      const hyp = Math.sqrt(dx * dx + dy * dy);
      let vx = dx / hyp * speed;
      let vy = dy / hyp * speed;

      // spawn bullet at offset
      const offset = 30;
      const Xoffset = offset * (vx / Math.sqrt(vx * vx + vy * vy));
      const Yoffset = offset * (vy / Math.sqrt(vx * vx + vy * vy));

      const pos = { x: x + Xoffset, y: y + Yoffset, vx, vy };
      world.addEntity(Projectile({ radius: 4, pos }), 2000);
    }
  })
}
