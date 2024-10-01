import { Component, ValidSounds, World } from "@piggo-gg/core";

export type Health = Component<"health", { health: number, maxHealth: number }> & {
  showHealthBar: boolean
  deathSounds: ValidSounds[]
  onDamage: null | ((damage: number, world: World) => void)
}

export type HealthProps = {
  health: number,
  maxHealth?: number,
  showHealthBar?: boolean
  deathSounds?: ValidSounds[]
  onDamage?: null | ((damage: number, world: World) => void)
}

export const Health = ({ health, maxHealth, showHealthBar = true, deathSounds, onDamage }: HealthProps): Health => ({
  type: "health",
  data: { health, maxHealth: maxHealth ?? health },
  showHealthBar,
  deathSounds: deathSounds ?? [],
  onDamage: onDamage ?? null
})
