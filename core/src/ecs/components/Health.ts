import { Component, Sound, ValidSounds } from "@piggo-gg/core";

export type Health = Component<"health", { health: number, maxHealth: number }> & {
  showHealthBar: boolean
  deathSounds: ValidSounds[]
}

export type HealthProps = {
  health: number,
  maxHealth?: number,
  showHealthBar?: boolean
  deathSounds?: ValidSounds[]
}

export const Health = ({ health, maxHealth, showHealthBar = true, deathSounds }: HealthProps): Health => ({
  type: "health",
  data: { health, maxHealth: maxHealth ?? health },
  showHealthBar,
  deathSounds: deathSounds ?? []
})
