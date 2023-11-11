import { Container } from "pixi.js";
import { Component, Renderer } from "@piggo-legends/core";

export type RenderableProps = {
  cameraPos?: { x: number; y: number }
  container?: Container
  debuggable?: boolean
  dynamic?: (c: Container) => void
  renderer: Renderer
  zIndex?: number
}

export class Renderable<T extends RenderableProps = RenderableProps> implements Component<"renderable"> {
  type: "renderable";

  id: string;
  props: T;
  c: Container = new Container();

  constructor(props: T) {
    if (props.container) {
      this.c = props.container;
    }

    this.props = {
      ...props,
      debuggable: props.debuggable || false,
    };
    this._init();
  }

  _init = () => {
    this.c.zIndex = this.props.zIndex || 0;
    this.c.sortableChildren = true;
    this.c.alpha = 1;

    // for each child set alpha 1
    this.c.children.forEach((child) => {
      child.alpha = 1;
    });

    // callback
    if (this.props.dynamic) {
      this.props.renderer.app.ticker.add(this.onTick);
    }
  }

  onTick = () => {
    if (this.props.dynamic) {
      this.props.dynamic(this.c);
    }
  }

  // Renderable.cleanup MUST be called to correctly destroy the object
  cleanup = () => {
    // remove from the renderer
    this.props.renderer.app.stage.removeChild(this.c);

    // remove onTick callback
    this.props.renderer.app.ticker.remove(this.onTick);

    // remove all event listeners
    this.c.removeAllListeners();

    // remove from the world
    this.c.destroy();
  }
}
