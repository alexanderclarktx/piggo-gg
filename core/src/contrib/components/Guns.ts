import { Component, Entity, Position, Renderable } from "@piggo-gg/core";
import { Sprite } from "pixi.js";

export type GunsProps = {
  name: string;
  damage: number;
  speed: number;
  clipSize: number;
  reloadTime: number;
}

export class Guns extends Component<"guns"> {
  type: "guns" = "guns";
  name: string;
  damage: number;
  speed: number;
  clipSize: number;
  reloadTime: number;

  constructor(props: GunsProps) {
    super();
    this.name = props.name;
    this.damage = props.damage;
    this.speed = props.speed;
    this.clipSize = props.clipSize;
    this.reloadTime = props.reloadTime;
  }
}

export const Pistol = new Guns({ name: "pistol", damage: 10, speed: 200, clipSize: 7, reloadTime: 1 });
export const Shotgun = new Guns({ name: "shotgun", damage: 20, speed: 150, clipSize: 2, reloadTime: 2 });
export const MachineGun = new Guns({ name: "machinegun", damage: 5, speed: 300, clipSize: 30, reloadTime: 3 });
export const Sniper = new Guns({ name: "sniper", damage: 50, speed: 400, clipSize: 1, reloadTime: 2 });
