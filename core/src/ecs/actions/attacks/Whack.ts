import {
  Action, blocks, Character, DamageCalculation, Hitbox, HitboxProps,
  ItemActionParams, KeyMouse, onHitCalculate, ValidSounds, XYZtoIJK
} from "@piggo-gg/core"

export const WhackBlock = Action("whack", ({ params, world, player, entity }) => {
  const { hold, mouse } = params as ItemActionParams
  if (hold) return

  const character = player?.components.controlling.getCharacter(world)
  if (!character) return

  const { position } = entity?.components ?? {}
  if (!position) return

  const rotation = world.flipped() * (position.data.pointingDelta.x > 0 ? 1 : -1)
  position.setRotation(rotation)

  const xyz = blocks.atMouse(mouse, character.components.position.data)?.block
  if (!xyz) {
    world.client?.soundManager.play("whiff")
    return
  }

  const spot = XYZtoIJK(xyz)
  blocks.remove(spot, world)

  world.client?.soundManager.play("clink")
})

export const Whack = (sound: ValidSounds, damage: DamageCalculation) => Action<KeyMouse & { character: string }>(
  "whack",
  ({ world, params, entity }) => {
    if (!entity) return

    const { mouse, character } = params

    if (!mouse || !character) return

    const characterEntity = world.entities[character] as Character
    if (!characterEntity || !characterEntity.components.team) return

    const { position } = entity.components
    if (!position) return

    const rotation = world.flipped() * (position.data.pointingDelta.x > 0 ? 1 : -1)
    position.rotate(rotation)

    const angle = Math.atan2(position.data.pointingDelta.y, position.data.pointingDelta.x)

    const hitboxParams: HitboxProps = {
      pos: {
        x: position.data.x + Math.cos(angle) * 10,
        y: position.data.y + Math.sin(angle) * 10,
      },
      radius: 20,
      id: `hitbox-whack-${world.random.int(1000)}`,
      visible: false,
      expireTicks: 2,
      onHit: (e2, world) => {
        const hit = onHitCalculate(characterEntity.components.team.data.team, damage)(e2, world)
        if (hit) world.client?.soundManager.play(sound)
        return hit
      },
      onExpire: () => {
        world.client?.soundManager.play("whiff")
      }
    }

    world.addEntity(Hitbox(hitboxParams))
  },
  15
)
