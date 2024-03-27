import { Component, Entity, World } from "@piggo-gg/core";

export type Action<T extends {} = {}> = {
  apply: (params: T, entity: Entity, world: World, player?: string) => void
  // validate: (entity: Entity, world: World, player?: string) => boolean
}

export const Action = (apply: Action["apply"]): Action => {
  return { apply };
}

export type InvokedAction<A extends string = string, P extends {} = {}> = {
  action: A,
  params: P
}

export type ActionMap<T extends string = string, P extends {} = {}> = Record<T, Action<P>>;

export class Actions extends Component<"actions"> {
  type: "actions" = "actions";
  actionMap: ActionMap;

  constructor(actionMap: ActionMap) {
    super();
    this.actionMap = actionMap;
  }
}
