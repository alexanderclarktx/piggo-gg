import { Component, Renderable, RenderableProps, Renderer } from "@piggo-legends/core";

type CC = {
  renderable?: Renderable<RenderableProps>
}

export type EntityProps = {
  renderer: Renderer,
  id: string,
  components: CC,
  networked?: boolean
}


// const ComponentTypes: CC = {
//   [Renderable.type]: undefined
// };

// type ComponentMap = {
//   [K in keyof typeof componentTypes]: InstanceType<typeof componentTypes[K]>
// }

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
