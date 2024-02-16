import { Component, Entity, World } from "@piggo-legends/core";

export type NPCProps<T> = {
  onTick: (entity: Entity, world: World) => T | null;
};

export class NPC<T extends string = string> extends Component<"npc"> {
  type: "npc" = "npc";
  props: NPCProps<T>;

  constructor(props: NPCProps<T>) {
    super();
    this.props = props;
  }
}
