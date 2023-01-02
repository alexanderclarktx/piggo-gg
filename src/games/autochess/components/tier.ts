import { Component } from "../../shared/ecs";

export class Tier extends Component {
  level: number;

  constructor(level: number) {
    super();
    this.level = level;
  }
}
