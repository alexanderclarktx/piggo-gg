import { Component } from "@ts-game-project/ecstacy";

export class Tier extends Component {
  level: number;

  constructor(level: number) {
    super();
    this.level = level;
  }
}
