import { Action, Character, KeyMouse, SpawnHitboxProps, randomInt } from "@piggo-gg/core"

export const Shoot = Action<KeyMouse & { id: number, character: string }>("shoot", ({ world, params, entity }) => {

  if (!entity) return

  const characterEntity = world.entities[params.character] as Character
  if (!characterEntity || !characterEntity.components.team) return

  const { position, team } = characterEntity.components
  const { gun } = entity.components
  if (!gun || !position || !team) return

  if (gun.canShoot(world, params.tick, params.hold)) {
    gun.didShoot(world)

    const { x, y } = position.data
    const { speed } = gun.data

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
      radius: gun.data.bulletSize,
      damage: () => gun.data.damage,
      id: randomInt(1000),
      visible: true,
      expireTicks: 35
    }

    world.actionBuffer.push(world.tick + 3, entity.id, { actionId: "spawnHitbox", params: bulletParams })

    world.client?.soundManager.play(gun.data.name)

    // auto reload
    if (gun.data.clip === 0) {
      const reload = entity.components.actions?.actionMap["reload"]
      if (reload) world.actionBuffer.push(world.tick + 1, entity.id, { actionId: "reload" })
    }
  }
})
