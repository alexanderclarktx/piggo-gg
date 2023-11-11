import { Component, Entity,  Game, GameProps } from "@piggo-legends/core";

export type Action = (entity: Entity , game: Game<GameProps>, player?: string) => void;

export type ActionMap = Record<string, Action>;

export class Actions implements Component<"actions"> {
  type: "actions";

  map: ActionMap;

  constructor(actionMap: ActionMap) {
    this.map = actionMap;
  }
}
