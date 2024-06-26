import { Component, World } from "@piggo-gg/core";

export type Gun = Component<"gun", { id: number }> & {
  automatic: boolean
  bulletSize: number
  clipSize: number
  damage: number
  fireRate: number
  lastShot: number
  name: string
  reloadTime: number
  speed: number
  canShoot: (world: World, tick: number) => boolean
  shoot: (world: World) => void
}

export type GunProps = {
  automatic: boolean
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
      id: Math.round(Math.random() * 100000)
    },
    automatic: props.automatic,
    bulletSize: props.bulletSize,
    clipSize: props.clipSize,
    damage: props.damage,
    fireRate: props.fireRate,
    lastShot: 0,
    name: props.name,
    reloadTime: props.reloadTime,
    speed: props.speed,
    canShoot: (world: World, tick: number) => {

      // check firing rate
      if ((gun.lastShot + gun.fireRate) > world.tick) return false;

      // check auto/semi
      if (!props.automatic && gun.lastShot >= tick) return false;

      return true;
    },
    shoot: (world: World) => {
      gun.lastShot = world.tick;
    }
  }
  return gun;
}

export const Deagle = GunBuilder({
  name: "deagle",
  automatic: false,
  bulletSize: 3,
  clipSize: 15,
  damage: 15,
  fireRate: 3,
  reloadTime: 1,
  speed: 400
});

export const AK = GunBuilder({
  name: "ak",
  automatic: true,
  bulletSize: 4,
  clipSize: 25,
  damage: 25,
  fireRate: 8,
  reloadTime: 3,
  speed: 500
});

export const AWP = GunBuilder({
  name: "awp",
  automatic: false,
  bulletSize: 5,
  clipSize: 1,
  damage: 100,
  fireRate: 40,
  reloadTime: 2,
  speed: 600
});
