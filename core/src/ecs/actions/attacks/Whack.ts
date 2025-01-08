import { Action, Character, DamageCalculation, KeyMouse, randomInt, SpawnHitboxProps, ValidSounds } from "@piggo-gg/core"

export const Whack = (sound: ValidSounds, damage: DamageCalculation) => Action<KeyMouse & { character: Character }>(
  "whack",
  ({ world, params, entity }) => {
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
        x: position.data.x + Math.cos(angle) * 10,
        y: position.data.y + Math.sin(angle) * 10,
      },
      team: character.components.team,
      radius: 20,
      damage,
      id: randomInt(1000),
      visible: false,
      expireTicks: 2,
      onHit: () => {
        world.client?.soundManager.play(sound)
      },
      onExpire: () => {
        world.client?.soundManager.play("whiff")
      }
    }

    world.actionBuffer.push(world.tick + 1, entity.id, { actionId: "spawnHitbox", params: hurtboxParams })
  },
  15
)
