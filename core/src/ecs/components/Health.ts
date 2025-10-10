import {
  Component, Entity, max, SystemBuilder, ValidSounds, World
} from "@piggo-gg/core"

export type Health = Component<"health", { hp: number, maxHp: number, died: number | undefined }> & {
  showHealthBar: boolean
  deathSounds: ValidSounds[]
  onDamage: null | ((damage: number, world: World) => void)
  damage: (damage: number, world: World) => void
  dead: () => boolean
}

export type HealthProps = {
  hp?: number,
  maxHp?: number,
  showHealthBar?: boolean
  deathSounds?: ValidSounds[]
  onDamage?: null | ((damage: number, world: World) => void)
}

export const Health = (
  { hp, maxHp, showHealthBar = true, deathSounds, onDamage }: HealthProps = {}
): Health => {

  const health: Health = {
    type: "health",
    data: {
      hp: hp ?? 100,
      maxHp: maxHp ?? hp ?? 100,
      died: undefined
    },
    showHealthBar,
    deathSounds: deathSounds ?? [],
    onDamage: onDamage ?? null,
    damage: (damage: number, world: World) => {
      health.data.hp = max(0, health.data.hp - damage)

      if (health.onDamage) health.onDamage(damage, world)

      if (health.data.hp <= 0 && health.data.died === undefined) {
        health.data.died = world.tick
      }
    },
    dead: () => health.data.hp <= 0
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
