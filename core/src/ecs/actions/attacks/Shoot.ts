import { Action, Gun, KeyMouse, PositionProps, Projectile, Team, TeamColors, onHitTeam, playSound, random } from "@piggo-gg/core";

export const Shoot = Action<KeyMouse & { id: number }>(({ world, params, entity }) => {

  if (!entity) return;

  const { gun, position, team } = entity.components;
  if (!gun || !position || !team) return;

  if (gun.canShoot(world, params.tick, params.mouse.hold)) {
    gun.didShoot(world);

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

    world.actionBuffer.push(world.tick + 3, entity.id, { action: "spawnBullet", params: { team, gun, ...pos, id: params.id } });

    playSound(world.client?.sounds[gun.name]);

    // auto reload
    if (gun.data.clip === 0) {
      const reload = entity.components.actions?.actionMap["reload"];
      if (reload) world.actionBuffer.push(world.tick + 1, entity.id, { action: "reload" });
    }
  }
})

export const SpawnBullet = Action<PositionProps & { team: Team, gun: Gun, id: number }>(({ world, params }) => {

  const { team, gun } = params;

  world.addEntity(Projectile({
    id: `projectile-${random()}`,
    pos: params,
    radius: gun.bulletSize,
    color: TeamColors[team.data.team],
    onHit: onHitTeam(team.data.team, gun.damage)
  }));
})
