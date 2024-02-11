import { Component, Entity, Game } from "@piggo-legends/core";

export type Action = (entity: Entity, game: Game, player?: string) => void;
export type ActionMap<T extends string = string> = Record<T, Action>;

export class Actions<T extends string = string> extends Component<"actions"> {
  // type: "actions";

  actionMap: ActionMap<T>;

  constructor(actionMap: ActionMap<T>) {
    super();
    this.actionMap = actionMap;
  }
}
