import { Component } from "@piggo-gg/core";

export type Health = Component<"health"> & {
  data: {
    health: number,
    maxHealth: number,
  }
  showHealthBar: boolean
}

export type HealthProps = {
  health: number,
  maxHealth: number,
  showHealthBar?: boolean
}

export const Health = ({ health, maxHealth, showHealthBar = true }: HealthProps): Health => ({
  type: "health",
  data: { health, maxHealth },
  showHealthBar
})
