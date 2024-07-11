import { Action, Effect, Gun } from "@piggo-gg/core";

export const Reload = Action(({ entity }) => {
  if (!entity) return;

  const { gun, effects } = entity.components;
  if (!gun || !effects) return;

  // check if gun can be reloaded
  if (gun.reloading) return;
  if (gun.data.clip === gun.clipSize) return;
  if (gun.data.ammo <= 0) return;

  effects.addEffect("reload", ReloadEffect(gun));
});

const ReloadEffect = (gun: Gun): Effect => ({
  duration: gun.reloadTime,
  onStart: () => {
    console.log("reloading");
    gun.reloading = true;
  },
  onEnd: () => {
    if (gun.data.ammo < gun.clipSize) {
      gun.data.clip = gun.data.ammo;
      gun.data.ammo = 0;
    } else {
      gun.data.ammo -= gun.clipSize - gun.data.clip;
      gun.data.clip = gun.clipSize;
    }

    gun.reloading = false;
  }
})
