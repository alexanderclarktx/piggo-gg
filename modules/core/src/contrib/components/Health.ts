import { Component } from "@piggo-legends/core";

// the health component includes health, maxHealth, and damage
export class Health extends Component<"health"> {
  // type: "health";

  health: number;
  maxHealth: number;

  constructor(health: number, maxHealth: number) {
    super();
    this.health = health;
    this.maxHealth = maxHealth;
  }
}
