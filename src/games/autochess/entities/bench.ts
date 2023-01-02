import { Entity } from "../../shared/ecs";
import { Unit } from "./unit";

export class Bench extends Entity {
  units: Unit[];
  constructor() {
    super();
    this.units = [];
  }
}
