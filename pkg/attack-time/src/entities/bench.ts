import { Entity } from "@piggo-legends/ecstacy";
import { Unit } from "./unit";

export class Bench extends Entity {
  units: Unit[];
  constructor() {
    super();
    this.units = [];
  }
}
