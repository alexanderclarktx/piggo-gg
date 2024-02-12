import { Component, Entity, Game } from "@piggo-legends/core";

export type Action = (entity: Entity, game: Game, player?: string) => void;
export type ActionMap<T extends string = string> = Record<T, Action>;

export class Actions extends Component<"actions"> {
  type: "actions" = "actions";
  actionMap: ActionMap;

  constructor(actionMap: ActionMap) {
    super();
    this.actionMap = actionMap;
  }
}
