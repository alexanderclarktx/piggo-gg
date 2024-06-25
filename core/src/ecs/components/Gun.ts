import { Component, World } from "@piggo-gg/core";

export type Gun = Component<"gun", { id: number }> & {
  name: string
  damage: number
  speed: number
  clipSize: number
  lastShot: number
  reloadTime: number
  fireRate: number
  canShoot: (world: World) => boolean
  shoot: (world: World) => void
}

export type GunProps = {
  name: string;
  damage: number;
  speed: number;
  clipSize: number;
  reloadTime: number;
  fireRate: number;
}

export const Gun = (props: GunProps): Gun => {

  const gun: Gun = {
    type: "gun",
    data: {
      id: Math.round(Math.random() * 100000)
    },
    name: props.name,
    damage: props.damage,
    speed: props.speed,
    clipSize: props.clipSize,
    lastShot: 0,
    reloadTime: props.reloadTime,
    fireRate: props.fireRate,
    canShoot: (world: World) => {
      const canShoot = (gun.lastShot + gun.fireRate) <= world.tick;
      return canShoot;
    },
    shoot: (world: World) => {
      gun.lastShot = world.tick;
    }
  }
  return gun;
}

const GunBuilder = (props: GunProps) => () => Gun(props);

export const Pistol = GunBuilder({ name: "pistol", damage: 10, speed: 500, clipSize: 7, reloadTime: 1, fireRate: 6 });
export const Shotgun = GunBuilder({ name: "shotgun", damage: 20, speed: 150, clipSize: 2, reloadTime: 2, fireRate: 2 });
export const MachineGun = GunBuilder({ name: "machinegun", damage: 5, speed: 300, clipSize: 30, reloadTime: 3, fireRate: 10 });
export const Sniper = GunBuilder({ name: "sniper", damage: 50, speed: 400, clipSize: 1, reloadTime: 2, fireRate: 2 });
