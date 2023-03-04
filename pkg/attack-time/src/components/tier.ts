import { Component } from "@piggo-legends/gamertc";

export class Tier extends Component {
  level: number;

  constructor(level: number) {
    super();
    this.level = level;
  }
}
