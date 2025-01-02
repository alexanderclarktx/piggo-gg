import { Component, Entity, World } from "@piggo-gg/core"

export type Effect = {
  duration: number
  onStart: (entity: Entity, world: World) => void
  onTick?: (entity: Entity, world: World) => void
  onEnd: (entity: Entity, world: World) => void
}

type EffectWithCd = Effect & { cdLeft: number | undefined }

export type Effects = Component<"effects"> & {
  effects: Record<string, EffectWithCd>
  addEffect: (name: string, effect: Omit<Effect, "cdLeft">) => void
}

export const Effects = (): Effects => {
  const effects: Effects = {
    type: "effects",
    effects: {},
    addEffect: (name, effect) => {
      effects.effects[name] = {
        ...effect,
        cdLeft: undefined
      }
    }
  }
  return effects
}
