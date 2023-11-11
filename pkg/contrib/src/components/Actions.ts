import { Component, Entity,  Game, GameProps } from "@piggo-legends/core";

export type Action = (entity: Entity, game: Game<GameProps>, player?: string) => void;
export type ActionMap<T extends string = string> = Record<T, Action>;

export class Actions<T extends string = string> implements Component<"actions"> {
  type: "actions";

  map: ActionMap<T>;

  constructor(actionMap: ActionMap<T>) {
    this.map = actionMap;
  }
}
