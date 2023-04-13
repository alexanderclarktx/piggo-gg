import { Component } from "@piggo-legends/core";

export class Tier extends Component {
  level: number;

  constructor(level: number) {
    super();
    this.level = level;
  }
}
