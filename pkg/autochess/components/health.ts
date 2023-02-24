import { Component } from "@ts-game-project/ecstacy";

// the health component includes health, maxHealth, and damage
export class Health extends Component {
  health: number;
  maxHealth: number;

  constructor(health: number, maxHealth: number) {
    super();
    this.health = health;
    this.maxHealth = maxHealth;
  }
}
