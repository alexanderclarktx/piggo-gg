import { Component, Entity, World } from "@piggo-gg/core";

export type Effect = {
  duration: number
  onStart: (entity: Entity, world: World) => void
  onTick?: (entity: Entity, world: World) => void
  onEnd: (entity: Entity, world: World) => void
}

type EffectWithCd = Effect & { cdLeft: number | undefined }

export class Effects extends Component<"effects"> {
  type: "effects" = "effects";

  effects: Record<string, EffectWithCd> = {};

  addEffect(name: string, effect: Omit<Effect, "cdLeft">) {
    this.effects[name] = {
      ...effect,
      cdLeft: undefined
    };
  }
}
