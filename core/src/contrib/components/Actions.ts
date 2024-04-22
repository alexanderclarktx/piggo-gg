import { Component, Entity, World } from "@piggo-gg/core";

export type Action<T extends {} = {}> = {
  cooldown?: number
  cdLeft?: number
  apply: (_: { params: T, world: World, entity?: Entity, player?: string | undefined }) => void
  // validate: (entity: Entity, world: World, player?: string) => boolean
}

export const Action = <T extends {} = {}>(apply: Action<T>["apply"], cooldown?: number): Action<T> => {
  return {
    apply,
    ...cooldown ? { cooldown } : {}
  };
}

export type InvokedAction<A extends string = string, P extends {} = {}> = {
  action: A,
  params?: P
}

export type ActionMap<P extends {} = {}> = Record<string, Action<P>>;

export class Actions extends Component<"actions"> {
  type: "actions" = "actions";
  actionMap: ActionMap;

  constructor(actionMap: ActionMap) {
    super();
    this.actionMap = actionMap;
  }
}
