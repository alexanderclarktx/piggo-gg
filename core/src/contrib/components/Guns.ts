import { Component } from "@piggo-gg/core";

export type GunsProps = {
  name: string;
  damage: number;
  speed: number;
  clipSize: number;
  reloadTime: number;
  fireRate: number;
}

export class Guns extends Component<"guns"> {
  type: "guns" = "guns";
  name: string;
  damage: number;
  speed: number;
  fireRate: number;
  clipSize: number;
  reloadTime: number;

  override data = {
    lastShot: 0
  }

  constructor(props: GunsProps) {
    super();
    this.name = props.name;
    this.damage = props.damage;
    this.speed = props.speed;
    this.clipSize = props.clipSize;
    this.reloadTime = props.reloadTime;
    this.fireRate = props.fireRate;
  }

  shoot = () => {
    this.data.lastShot = Date.now();
  }

  canShoot = () => {
    const canShoot = Date.now() - this.data.lastShot > 10000 / this.fireRate;
    console.log(canShoot, Date.now() - this.data.lastShot, 10000 / this.fireRate);
    return canShoot;
  }
}

export const Pistol = new Guns({ name: "pistol", damage: 10, speed: 200, clipSize: 7, reloadTime: 1, fireRate: 30 });
export const Shotgun = new Guns({ name: "shotgun", damage: 20, speed: 150, clipSize: 2, reloadTime: 2, fireRate: 2 });
export const MachineGun = new Guns({ name: "machinegun", damage: 5, speed: 300, clipSize: 30, reloadTime: 3, fireRate: 10 });
export const Sniper = new Guns({ name: "sniper", damage: 50, speed: 400, clipSize: 1, reloadTime: 2, fireRate: 2 });
