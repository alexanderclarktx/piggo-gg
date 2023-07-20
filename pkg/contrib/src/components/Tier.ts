import { Component } from "@piggo-legends/core";

export class Tier implements Component<"tier"> {
  type: "tier";

  level: number;

  constructor(level: number) {
    this.level = level;
  }
}
