import { Component } from "@piggo-legends/core";

export class Tier implements Component {
  level: number;

  constructor(level: number) {
    this.level = level;
  }
}
