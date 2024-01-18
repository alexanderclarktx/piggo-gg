import { Component, Entity, Game } from "@piggo-legends/core";

export type NPCProps<T> = {
  onTick: (entity: Entity, game: Game) => T | null;
};

export class NPC<T extends string = string> implements Component<"npc"> {
  type: "npc";

  props: NPCProps<T>;

  constructor(props: NPCProps<T>) {
    this.props = props;
  }
}
