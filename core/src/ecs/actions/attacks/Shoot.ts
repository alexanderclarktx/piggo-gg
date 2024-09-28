import { Action, Character, KeyMouse, SpawnHitboxProps, playSound, randomInt } from "@piggo-gg/core"

export const Shoot = Action<KeyMouse & { id: number, character: Character }>(({ world, params, entity }) => {

  if (!entity) return

  const { position, team } = params.character.components
  const { gun } = entity.components
  if (!gun || !position || !team) return

  if (gun.canShoot(world, params.tick, params.mouse.hold)) {
    gun.didShoot(world)

    const { x, y } = position.data
    const { speed } = gun

    // distance to mouse
    let dx = params.mouse.x - x
    let dy = params.mouse.y - y

    // normalize
    const hyp = Math.sqrt(dx * dx + dy * dy)
    let vx = dx / hyp * speed
    let vy = dy / hyp * speed

    // spawn bullet at offset
    const offset = 30
    const Xoffset = offset * (vx / Math.sqrt(vx * vx + vy * vy))
    const Yoffset = offset * (vy / Math.sqrt(vx * vx + vy * vy))

    const bulletParams: SpawnHitboxProps = {
      pos: { x: x + Xoffset, y: y + Yoffset, velocity: { x: vx, y: vy } },
      team,
      radius: gun.bulletSize,
      damage: gun.damage,
      id: randomInt(1000),
      visible: true,
      expireTicks: 35
    }

    world.actionBuffer.push(world.tick + 3, entity.id, { action: "spawnBullet", params: bulletParams })

    playSound(world.client?.sounds[gun.name])

    // auto reload
    if (gun.data.clip === 0) {
      const reload = entity.components.actions?.actionMap["reload"]
      if (reload) world.actionBuffer.push(world.tick + 1, entity.id, { action: "reload" })
    }
  }
})
