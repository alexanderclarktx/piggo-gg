import { Action, Character, DamageCalculation, KeyMouse, playSound, randomInt, SpawnHitboxProps, ValidSounds } from "@piggo-gg/core"

export const Whack = (sound: ValidSounds, damage: DamageCalculation) => Action<KeyMouse & { character: Character }>(({ world, params, entity }) => {
  if (!entity) return

  const { mouse, character } = params

  if (!mouse || !character) return

  const { position } = entity.components
  if (!position) return

  if (position.data.pointingDelta.x > 0) {
    position.rotateUp(1)
  } else {
    position.rotateDown(1)
  }

  const angle = Math.atan2(position.data.pointingDelta.y, position.data.pointingDelta.x)

  const hurtboxParams: SpawnHitboxProps = {
    pos: {
      x: position.data.x + Math.cos(angle) * 30,
      y: position.data.y + Math.sin(angle) * 30,
    },
    team: character.components.team,
    radius: 20,
    damage,
    id: randomInt(1000),
    visible: false,
    expireTicks: 2,
    onHit: () => {
      playSound(world.client?.sounds[sound])
    },
    onExpire: () => {
      playSound(world.client?.sounds["whiff"])
    }
  }

  world.actionBuffer.push(world.tick + 1, entity.id, { action: "spawnHitbox", params: hurtboxParams })
}, 15)
