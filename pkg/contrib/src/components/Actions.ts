import { Component, Entity, EntityProps, Game, GameProps } from "@piggo-legends/core";

export type Action = (entity: Entity<EntityProps> , game: Game<GameProps>) => void;

export type ActionMap = Record<string, Action>;

export class Actions implements Component<"actions"> {
  type: "actions";

  map: ActionMap;

  constructor(actionMap: ActionMap) {
    this.map = actionMap;
  }
}
