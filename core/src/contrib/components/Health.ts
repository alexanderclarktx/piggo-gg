import { Component } from "@piggo-gg/core";

// the health component includes health, maxHealth, and damage
export class Health extends Component<"health"> {
  type: "health" = "health";

  override data = {
    health: 0,
    maxHealth: 0
  }

  constructor(health: number, maxHealth: number) {
    super();
    this.data.health = health;
    this.data.maxHealth = maxHealth;
  }
}
