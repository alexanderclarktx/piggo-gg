import { Component } from "@piggo-gg/core";

export type HealthProps = {
  health: number,
  maxHealth: number,
  showHealthBar?: boolean
}

// the health component includes health, maxHealth, and damage
export class Health extends Component<"health"> {
  type: "health" = "health";

  override data = {
    health: 0,
    maxHealth: 0,
    showHealthBar: true,
  }

  constructor({health, maxHealth, showHealthBar}: HealthProps) {
    super();
    this.data.health = health;
    this.data.maxHealth = maxHealth;
    this.data.showHealthBar = showHealthBar ?? true;
  }
}
