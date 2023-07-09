import { Component } from "@piggo-legends/core";

export type EntityProps = {
  id: string,
  components: Record<string, Component<string>>,
  networked?: boolean
}

// an Entity is a collection of components
export class Entity<T extends EntityProps> {
  props: T;

  constructor(props: T) {
    this.props = props;
  }

  serialize = () => {
    // if (this.renderable && this.props.networked) {
    //   return {x: +this.renderable.c.position.x.toFixed(2), y: +this.renderable.c.position.y.toFixed(2)}
    // }
    return undefined;
  };
}
