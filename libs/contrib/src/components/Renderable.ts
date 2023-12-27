import { Container } from "pixi.js";
import { Component, Game, Renderer } from "@piggo-legends/core";

export type RenderableProps = {
  renderer: Renderer
  position?: { x: number; y: number }
  cameraPos?: { x: number; y: number }
  container?: Container
  children?: Renderable[]
  debuggable?: boolean
  dynamic?: (c: Container, r: Renderable, g: Game) => void
  zIndex?: number
  visible?: boolean
  id?: string
  cacheAsBitmap?: boolean
  interactiveChildren?: boolean
}

export class Renderable<T extends RenderableProps = RenderableProps> implements Component<"renderable"> {
  type: "renderable";

  id: string;
  props: T;
  c: Container = new Container();

  constructor(props: T) {
    // set container
    if (props.container) this.c = props.container;

    // add children
    if (props.children) {
      this.c.addChild(...props.children.map((child) => child.c));
    }

    // set position
    if (props.position) this.c.position.set(props.position.x, props.position.y);

    // set id
    this.id = props.id ?? "";

    // TODO this should always be false (need to refactor buttons)
    // set interactive children false
    this.c.interactiveChildren = props.interactiveChildren ?? true;

    // set visible
    this.c.visible = props.visible ?? true;

    // set cacheAsBitmap
    this.c.cacheAsBitmap = props.cacheAsBitmap ?? false;

    // add debugable to props
    this.props = { ...props, debuggable: props.debuggable ?? false };

    this._init();
  }

  _init = () => {
    this.c.zIndex = this.props.zIndex || 0;
    this.c.sortableChildren = true;
    this.c.alpha = 1;
    this.c.children.forEach((child) => { child.alpha = 1 });
  }

  // cleanup MUST be called to correctly destroy the object
  cleanup = () => {
    this.props.renderer.app.stage.removeChild(this.c); // remove from the renderer
    this.c.removeAllListeners(); // remove all event listeners
    this.c.destroy(); // remove from the world
  }
}
