import { Component, Entity, entries, SystemBuilder, World } from "@piggo-gg/core"

export type Effect = {
  duration: number
  onStart: (entity: Entity, world: World) => void
  onTick?: (entity: Entity, world: World) => void
  onEnd: (entity: Entity, world: World) => void
}

type EffectWithCd = Effect & { cdLeft: number | undefined }

export type Effects = Component<"effects"> & {
  live: Record<string, EffectWithCd>
  addEffect: (name: string, effect: Omit<Effect, "cdLeft">) => void
}

export const Effects = (): Effects => {
  const effects: Effects = {
    type: "effects",
    live: {},
    addEffect: (name, effect) => {
      effects.live[name] = {
        ...effect,
        cdLeft: undefined
      }
    }
  }
  return effects
}

export const EffectsSystem = SystemBuilder({
  id: "EffectsSystem",
  init: (world) => ({
    id: "EffectsSystem",
    query: ["effects"],
    priority: 8,
    onTick: (entities: Entity<Effects>[]) => {

      entities.forEach(entity => {
        const { effects } = entity.components

        entries(effects.live).forEach(([name, effect]) => {
          if (effect.cdLeft === undefined) {
            effect.cdLeft = effect.duration
            effect.onStart(entity, world)
          } else {
            effect.cdLeft -= 1
            if (effect.cdLeft <= 0) {
              effect.onEnd(entity, world)
              delete effects.live[name]
            } else if (effect.onTick) {
              effect.onTick(entity, world)
            }
          }
        })
      })
    }
  })
})
