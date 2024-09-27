import { Action, Effect, Gun, max, min } from "@piggo-gg/core"

export const Reload = Action(({ entity }) => {
  if (!entity) return

  const { gun, effects } = entity.components
  if (!gun || !effects) return

  if (gun.reloading) return

  if (gun.data.clip === gun.clipSize) return

  // TODO infinite ammo
  // if (gun.data.ammo <= 0) return

  effects.addEffect("reload", ReloadEffect(gun))
})

const ReloadEffect = (gun: Gun): Effect => ({
  duration: gun.reloadTime,
  onStart: () => {
    gun.reloading = true
  },
  onEnd: () => {
    gun.reloading = false

    const clip = min(gun.data.clip + gun.data.ammo, gun.clipSize)
    const ammo = max(gun.data.ammo - gun.clipSize + gun.data.clip, 0)

    // gun.data.clip = clip
    gun.data.clip = gun.clipSize // TODO infinite ammo
    gun.data.ammo = ammo
  }
})
