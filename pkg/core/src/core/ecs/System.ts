import { Entity } from "@piggo-legends/core";

export type SystemProps = {}

// a System is a stateless function that is applied to all entities that have a certain set of components
export abstract class System<T extends SystemProps> {
  props: T;

  constructor(props: T) {
    this.props = props;
  }

  abstract onTick: (_: Entity<any>[]) => void
}
