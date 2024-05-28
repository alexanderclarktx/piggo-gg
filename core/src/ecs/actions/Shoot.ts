import { Action, Projectile, XY, onHitTeam } from "@piggo-gg/core";

export const Shoot = Action<{ id: number, mouse: XY }>(({ world, params, entity }) => {

  if (!entity) return;

  const { gun, position, team } = entity.components;
  if (!gun || !position || !team) return;

  if (gun.canShoot()) {
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
    world.addEntity(Projectile({ radius: 4, pos, id: `projectile-${params.id}`, onHit: onHitTeam(team.data.team) }));
  }
})
