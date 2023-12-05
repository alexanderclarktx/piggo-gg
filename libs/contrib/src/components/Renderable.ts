import { Container } from "pixi.js";
import { Component, Renderer } from "@piggo-legends/core";

export type RenderableProps = {
  renderer: Renderer
  position?: { x: number; y: number }
  cameraPos?: { x: number; y: number }
  container?: Container
  children?: Renderable[]
  debuggable?: boolean
  dynamic?: (c: Container, r: Renderable) => void
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

    if (props.children) {
      // console.log(props.children.map((child) => child.c.position));
      props.children.forEach((child) => {
        this.c.addChild(child.c);
      });
    }

    if (props.position) {
      this.c.position.set(props.position.x, props.position.y);
    }

    this.props = {
      ...props,
      debuggable: props.debuggable ?? true,
    };
    this._init();
  }

  _init = () => {
    this.c.zIndex = this.props.zIndex || 0;
    this.c.sortableChildren = true;
    this.c.alpha = 1;

    // for each child set alpha 1
    this.c.children.forEach((child) => { child.alpha = 1 });

    // "dynamic" property sets an ontick callback
    if (this.props.dynamic) { this.props.renderer.app.ticker.add(this.onTick) }
  }

  onTick = () => {
    if (this.props.dynamic) {
      this.props.dynamic(this.c, this);
    }
  }

  // cleanup MUST be called to correctly destroy the object
  cleanup = () => {
    this.props.renderer.app.stage.removeChild(this.c); // remove from the renderer
    this.props.renderer.app.ticker.remove(this.onTick); // remove onTick callback
    this.c.removeAllListeners(); // remove all event listeners
    this.c.destroy(); // remove from the world
  }
}
