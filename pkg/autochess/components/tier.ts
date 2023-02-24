import { Component } from "@piggo-legends/ecstacy";

export class Tier extends Component {
  level: number;

  constructor(level: number) {
    super();
    this.level = level;
  }
}
