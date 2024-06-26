import { Action, PositionProps, Projectile, TeamColors, XY, onHitTeam } from "@piggo-gg/core";

export const Point = Action<{ pointing: number }>(({ params, entity }) => {
  if (!entity) return;

  const { position } = entity.components;
  if (!position) return;

  position.data.pointing = params.pointing;
});

export const Shoot = Action<{ id: number, mouse: XY, tick: number }>(({ world, params, entity }) => {

  if (!entity) return;

  const { gun, position, team } = entity.components;
  if (!gun || !position || !team) return;

  if (gun.canShoot(world, params.tick)) {
    gun.shoot(world);

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

    const pos: PositionProps = { x: x + Xoffset, y: y + Yoffset, velocity: { x: vx, y: vy } };
    world.addEntity(Projectile({
      id: `projectile-${params.id}`,
      pos,
      radius: gun.size,
      color: TeamColors[team.data.team],
      onHit: onHitTeam(team.data.team, gun.damage)
    }));
  }
})
