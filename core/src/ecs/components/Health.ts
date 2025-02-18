import { Component, Entity, SystemBuilder, ValidSounds, World } from "@piggo-gg/core"

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

export const HealthSystem = SystemBuilder({
  id: "HealthSystem",
  init: (world) => ({
    id: "HealthSystem",
    query: ["health"],
    onTick: (entities: Entity<Health>[]) => {
      for (const entity of entities) {
        const { health } = entity.components
        if (health.data.health <= 0) {
          world.removeEntity(entity.id)

          if (world.runtimeMode === "client") {
            if (health.deathSounds.length > 0) {
              world.client?.soundManager.play(health.deathSounds, 0.1)
            }
          }
        }
      }
    }
  })
})
