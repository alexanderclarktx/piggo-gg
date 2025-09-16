import { Character, Component, Entity, entries, Player, World } from "@piggo-gg/core"

export type Action<T extends {} = any> = {
  id: string
  cooldown: number | undefined
  cdLeft?: number
  prepare: (_: { params: T, entity?: Entity, player?: Player }) => InvokedAction
  invoke: (_: {
    params: T,
    world: World,
    entity?: Entity,
    player?: Player | undefined,
    character?: Character | undefined }
  ) => void
  // validate: (entity: Entity, world: World, player?: string) => boolean
}

export const Action = <T extends {} = {}>(id: string, invoke: Action<T>["invoke"], cooldown?: number): Action<T> => ({
  id, cooldown, invoke,
  prepare: ({ params, entity, player }) => (
    { actionId: id, params: params ?? {}, entityId: entity?.id, playerId: player?.id }
  )
})

export type InvokedAction<A extends string = string, P extends {} = {}> = {
  actionId: A,
  characterId?: string | undefined,
  playerId?: string | undefined,
  entityId?: string | undefined
  params?: P
  offline?: boolean
}

export type ActionMap = Record<string, Action<any> | Action["invoke"]>

export type Actions = Component<"actions"> & {
  actionMap: Record<string, Action>
}

export const Actions = (actionMap: ActionMap = {}): Actions => {

  const newActions: Record<string, Action> = {}

  entries(actionMap).forEach(([id, action]) => {
    if (typeof action === "function") {
      newActions[id] = Action(id, action)
    } else {
      newActions[id] = action
    }
  })

  return {
    type: "actions",
    actionMap: newActions
  }
}
