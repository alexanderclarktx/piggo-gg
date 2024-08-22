import { Component } from "@piggo-gg/core";
import { Player } from "tone";

export type Health = Component<"health", { health: number, maxHealth: number }> & {
  showHealthBar: boolean
  deathSounds: Player[]
}

export type HealthProps = {
  health: number,
  maxHealth?: number,
  showHealthBar?: boolean
  deathSounds?: Player[]
}

export const Health = ({ health, maxHealth, showHealthBar = true, deathSounds }: HealthProps): Health => ({
  type: "health",
  data: { health, maxHealth: maxHealth ?? health },
  showHealthBar,
  deathSounds: deathSounds ?? []
})
