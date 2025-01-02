import { Component, Entity, InvokedAction, Position, World } from "@piggo-gg/core"

export type NPC = Component<"npc"> & {
  behavior: (entity: Entity<NPC | Position>, world: World) => InvokedAction | null | void
}

export type NPCProps<T extends string> = {
  behavior: (entity: Entity<NPC | Position>, world: World) => InvokedAction<T> | null | void
}

export const NPC = <T extends string>(props: NPCProps<T>): NPC => ({
  type: "npc",
  behavior: props.behavior
})
