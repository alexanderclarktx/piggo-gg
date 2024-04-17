import { Component } from "@piggo-gg/core";

export type GunProps = {
  name: string;
  damage: number;
  speed: number;
  clipSize: number;
  reloadTime: number;
  fireRate: number;
}

export class Gun extends Component<"gun"> {
  type: "gun" = "gun";
  name: string;
  damage: number;
  speed: number;
  fireRate: number;
  clipSize: number;
  reloadTime: number;
  lastShot = 0;

  override data = {
    id: Math.round(Math.random() * 100000)
  }

  constructor(props: GunProps) {
    super();
    this.name = props.name;
    this.damage = props.damage;
    this.speed = props.speed;
    this.clipSize = props.clipSize;
    this.reloadTime = props.reloadTime;
    this.fireRate = props.fireRate;
  }

  shoot = () => {
    this.lastShot = Date.now();
  }

  canShoot = () => {
    const canShoot = Date.now() - this.lastShot > 10000 / this.fireRate;
    return canShoot;
  }
}

export const Pistol = new Gun({ name: "pistol", damage: 10, speed: 200, clipSize: 7, reloadTime: 1, fireRate: 30 });
export const Shotgun = new Gun({ name: "shotgun", damage: 20, speed: 150, clipSize: 2, reloadTime: 2, fireRate: 2 });
export const MachineGun = new Gun({ name: "machinegun", damage: 5, speed: 300, clipSize: 30, reloadTime: 3, fireRate: 10 });
export const Sniper = new Gun({ name: "sniper", damage: 50, speed: 400, clipSize: 1, reloadTime: 2, fireRate: 2 });
