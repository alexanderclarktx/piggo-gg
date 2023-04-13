import { Container } from "pixi.js";
import { Renderer } from "@piggo-legends/core";

export type RenderableProps = {
  renderer: Renderer,
  container?: Container;
  debuggable?: boolean,
  pos?: { x: number; y: number },
  timeout?: number,
  zIndex?: number
  dynamic?: (c: Container) => void
  cameraPosition?: { x: number; y: number }
}

// todo don't extend container, just wrap it
export class Renderable<T extends RenderableProps> {
  id: string;
  props: T;
  c: Container = new Container();

  constructor(props: T) {
    if (props.container) {
      this.c = props.container;
    }

    this.props = {
      ...props,
      debuggable: props.debuggable || true,
    };
    this._init();
  }

  _init = () => {
    this.c.position.set(this.props.pos?.x || 0, this.props.pos?.y || 0);
    this.c.zIndex = this.props.zIndex || 0;
    this.c.sortableChildren = true;
    this.c.alpha = 1;

    // for each child set alpha 1
    this.c.children.forEach((child) => {
      child.alpha = 1;
    });

    // set a timeout
    if (this.props.timeout) {
      setTimeout(() => {
        this.cleanup();
      }, this.props.timeout);
    }

    // dynamic text
    if (this.props.dynamic) {
      this.props.renderer.app.ticker.add(this.onTick);
    }
  }

  onTick = () => {
    if (this.props.dynamic) {
      this.props.dynamic(this.c);
    }
  }

  // this MUST be called to correctly destroy the object
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
