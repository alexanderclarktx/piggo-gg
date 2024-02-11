import { Component, Entity, Game } from "@piggo-legends/core";

export type NPCProps<T> = {
  onTick: (entity: Entity, game: Game) => T | null;
};

export class NPC<T extends string = string> extends Component<"npc"> {
  // type: "npc";

  props: NPCProps<T>;

  constructor(props: NPCProps<T>) {
    super();
    this.props = props;
  }
}
