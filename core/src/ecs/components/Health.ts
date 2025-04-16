import {
  Component, Entity, SystemBuilder, ValidSounds, World
} from "@piggo-gg/core"

export type Health = Component<"health", { hp: number, maxHp: number }> & {
  showHealthBar: boolean
  deathSounds: ValidSounds[]
  onDamage: null | ((damage: number, world: World) => void)
  damage: (damage: number, world: World) => void
}

export type HealthProps = {
  hp: number,
  maxHp?: number,
  showHealthBar?: boolean
  deathSounds?: ValidSounds[]
  onDamage?: null | ((damage: number, world: World) => void)
}

export const Health = (
  { hp, maxHp, showHealthBar = true, deathSounds, onDamage }: HealthProps
): Health => {

  const health: Health = {
    type: "health",
    data: { hp, maxHp: maxHp ?? hp },
    showHealthBar,
    deathSounds: deathSounds ?? [],
    onDamage: onDamage ?? null,
    damage: (damage: number, world: World) => {
      health.data.hp -= damage
      if (health.onDamage) health.onDamage(damage, world)
    }
  }
  return health
}

export const HealthSystem = SystemBuilder({
  id: "HealthSystem",
  init: (world) => ({
    id: "HealthSystem",
    query: ["health"],
    priority: 5,
    onTick: (entities: Entity<Health>[]) => {
      for (const entity of entities) {
        const { health } = entity.components
        if (health.data.hp <= 0) {
          world.removeEntity(entity.id)

          if (world.client && health.deathSounds.length > 0) {
            // world.client?.soundManager.play(health.deathSounds, 0.1)
          }
        }
      }
    }
  })
})
