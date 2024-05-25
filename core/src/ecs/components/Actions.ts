import { Component, Controlling, Entity, Player, World } from "@piggo-gg/core";

export type Action<T extends {} = {}> = {
  cooldown?: number
  cdLeft?: number
  invoke: (_: { params: T, world: World, entity?: Entity, player?: Entity<Player | Controlling> | undefined }) => void
  // validate: (entity: Entity, world: World, player?: string) => boolean
}

export const Action = <T extends {} = {}>(invoke: Action<T>["invoke"], cooldown?: number): Action<T> => {
  return {
    invoke,
    ...cooldown ? { cooldown } : {}
  };
}

export type InvokedAction<A extends string = string, P extends {} = {}> = {
  action: A,
  playerId: string | undefined,
  params?: P
}

export type ActionMap<P extends {} = {}> = Record<string, Action<P>>;

export class Actions<P extends {} = {}> extends Component<"actions"> {
  type: "actions" = "actions";
  actionMap: ActionMap<P>;

  constructor(actionMap: ActionMap<P>) {
    super();
    this.actionMap = actionMap;
  }
}
