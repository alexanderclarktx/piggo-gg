import { Renderable } from "./Renderable";
import { Component } from "./Component";
import { Name } from "../../components/Name";
import { Renderer } from "../game/Renderer";

export type EntityProps = {
  name?: Name,
  components?: Component[],
  renderer: Renderer,
  networked?: boolean
}

// an Entity is a collection of components
export class Entity<T extends EntityProps> {
  props: T;
  rendered = false;
  renderable: Renderable<any> | undefined = undefined;

  constructor(props: T) {
    this.props = props;
  }

  serialize = () => {
    if (this.renderable && this.props.networked) {
      return {x: +this.renderable.position.x.toFixed(2), y: +this.renderable.position.y.toFixed(2)}
    }
    return undefined;
  };
}
