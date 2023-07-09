import { Component } from "@piggo-legends/core";

// the health component includes health, maxHealth, and damage
export class Health implements Component<"health"> {
  health: number;
  maxHealth: number;
  type: "health";

  constructor(health: number, maxHealth: number) {
    this.health = health;
    this.maxHealth = maxHealth;
  }
}
