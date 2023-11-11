import { Component } from "@piggo-legends/core";

export type EntityProps = {
  id: string,
  components: Record<string, Component<string>>,
  networked?: boolean
}

// an Entity is a collection of components
export class Entity {
  id: string;
  components: Record<string, Component<string>>;
  networked: boolean;

  constructor(props: EntityProps) {
    this.id = props.id;
    this.components = props.components;
    this.networked = props.networked ?? false;
  }
}
