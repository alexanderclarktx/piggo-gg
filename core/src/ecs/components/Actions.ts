import { Component, Entity, Noob, World } from "@piggo-gg/core"

export type Action<T extends {} = {}> = {
  cooldown?: number
  cdLeft?: number
  invoke: (_: { params: T, world: World, entity?: Entity, player?: Noob | undefined }) => void
  // validate: (entity: Entity, world: World, player?: string) => boolean
}

export const Action = <T extends {} = {}>(invoke: Action<T>["invoke"], cooldown?: number): Action<T> => {
  return {
    invoke,
    ...cooldown ? { cooldown } : {}
  }
}

export type InvokedAction<A extends string = string, P extends {} = {}> = {
  action: A,
  playerId?: string | undefined,
  entityId?: string | undefined
  params?: P
}

export type ActionMap<P extends {} = {}> = Record<string, Action<P>>

export type Actions = Component<"actions"> & {
  actionMap: ActionMap
}

export const Actions = <P extends {} = {}>(actionMap: ActionMap<P> = {}): Actions => ({
  type: "actions",
  actionMap
})
