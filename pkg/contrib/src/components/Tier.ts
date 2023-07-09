import { Component } from "@piggo-legends/core";

export class Tier implements Component<"tier"> {
  level: number;
  type: "tier";

  constructor(level: number) {
    this.level = level;
  }
}
