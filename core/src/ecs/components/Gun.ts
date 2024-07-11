import { Component, World } from "@piggo-gg/core";

export type Gun = Component<"gun", { id: number, clip: number, ammo: number }> & {
  automatic: boolean
  bulletSize: number
  clipSize: number
  damage: number
  fireRate: number
  lastShot: number
  outlineColor: number
  name: string
  reloading: boolean
  reloadTime: number
  speed: number
  canShoot: (world: World, tick: number) => boolean
  shoot: (world: World) => void
}

export type GunProps = {
  automatic: boolean
  ammo: number
  bulletSize: number
  clipSize: number
  damage: number
  fireRate: number
  name: string
  reloadTime: number
  speed: number
}

const GunBuilder = (props: GunProps) => () => Gun(props);

export const Gun = (props: GunProps): Gun => {

  const gun: Gun = {
    type: "gun",
    data: {
      id: Math.round(Math.random() * 100000),
      clip: props.clipSize,
      ammo: props.ammo
    },
    automatic: props.automatic,
    bulletSize: props.bulletSize,
    clipSize: props.clipSize,
    damage: props.damage,
    fireRate: props.fireRate,
    lastShot: 0,
    outlineColor: 0x000000,
    name: props.name,
    reloading: false,
    reloadTime: props.reloadTime,
    speed: props.speed,
    canShoot: (world: World, tick: number) => {

      // check firing rate
      if ((gun.lastShot + gun.fireRate) > world.tick) return false;

      // check auto/semi
      if (!props.automatic && gun.lastShot >= tick) return false;

      // check has clip
      if (gun.data.clip <= 0) return false;

      // check if it's reloading
      if (gun.reloading) return false;

      return true;
    },
    shoot: (world: World) => {
      gun.lastShot = world.tick;
      gun.data.clip -= 1;
    }
  }
  return gun;
}

export const Deagle = GunBuilder({
  name: "deagle",
  automatic: false,
  ammo: 45,
  clipSize: 15,
  damage: 15,
  fireRate: 3,
  reloadTime: 40,
  bulletSize: 3,
  speed: 400
});

export const AK = GunBuilder({
  name: "ak",
  automatic: true,
  ammo: 50,
  clipSize: 25,
  damage: 25,
  fireRate: 12,
  reloadTime: 60,
  bulletSize: 4,
  speed: 500
});

export const AWP = GunBuilder({
  name: "awp",
  automatic: false,
  ammo: 15,
  clipSize: 1,
  damage: 100,
  fireRate: 40,
  reloadTime: 80,
  bulletSize: 5,
  speed: 600
});
