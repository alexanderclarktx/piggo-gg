import { Component, Entity, World } from "@piggo-gg/core";

export interface Action {
  apply: (entity: Entity, world: World, player?: string) => void
  validate: (entity: Entity, world: World, player?: string) => boolean
}

export const ValidAction = (apply: Action["apply"]): Action => ({
  apply,
  validate: () => true
})

export type ActionMap<T extends string = string> = Record<T, Action>;

export class Actions extends Component<"actions"> {
  type: "actions" = "actions";
  actionMap: ActionMap;

  constructor(actionMap: ActionMap) {
    super();
    this.actionMap = actionMap;
  }
}
