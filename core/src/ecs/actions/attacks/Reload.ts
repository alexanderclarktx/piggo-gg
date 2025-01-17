import { Action, Effect, Entity, Gun, max, min } from "@piggo-gg/core"

export const Reload = Action("reload", ({ entity }) => {
  if (!entity) return

  const { gun, effects } = entity.components
  if (!gun || !effects) return

  if (gun.data.reloading) return

  if (gun.data.clip === gun.data.clipSize) return

  // TODO infinite ammo
  // if (gun.data.ammo <= 0) return

  effects.addEffect("reload", ReloadEffect(gun, entity))
})

const ReloadEffect = (gun: Gun, entity: Entity): Effect => ({
  duration: gun.data.reloadTime,
  onStart: () => {
    gun.data.reloading = true
    entity.components.renderable?.setOutline({ color: 0xff0000, thickness: 2 })
  },
  onEnd: () => {
    gun.data.reloading = false
    entity.components.renderable?.setOutline()

    const clip = min(gun.data.clip + gun.data.ammo, gun.data.clipSize)
    const ammo = max(gun.data.ammo - gun.data.clipSize + gun.data.clip, 0)

    // gun.data.clip = clip
    gun.data.clip = gun.data.clipSize // TODO infinite ammo
    gun.data.ammo = ammo
  }
})
