import { Component, Entity, InvokedAction, World } from "@piggo-gg/core";

export type NPCProps<T extends string> = {
  onTick: (entity: Entity, world: World) => InvokedAction<T> | null | void;
}

export class NPC<T extends string = string> extends Component<"npc"> {
  type: "npc" = "npc";
  props: NPCProps<T>;

  constructor(props: NPCProps<T>) {
    super();
    this.props = props;
  }
}
