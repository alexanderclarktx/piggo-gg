import { Container } from "pixi.js";
import { Component, Game, Renderer } from "@piggo-legends/core";

export type RenderableProps = {
  container?: (r: Renderer) => Promise<Container>
  children?: (r: Renderer) => Promise<Renderable[]>
  dynamic?: (c: Container, r: Renderable, g: Game) => void
  position?: { x: number; y: number }
  debuggable?: boolean
  zIndex?: number
  visible?: boolean
  id?: string
  cacheAsBitmap?: boolean
  interactiveChildren?: boolean
}

// TODO refactor and simplify how entities define renderables
export class Renderable<T extends RenderableProps = RenderableProps> implements Component<"renderable"> {
  type: "renderable";

  id: string;
  props: T;
  c: Container = new Container();
  r: Renderable | undefined;
  renderer: Renderer | undefined;
  children: Renderable[] | undefined;

  constructor(props: T) {
    this.props = {
      ...props,
      debuggable: props.debuggable ?? false,
    }
  }

  _init = async (renderer: Renderer) => {
    this.renderer = renderer;

    const { children, position, id, interactiveChildren, visible, cacheAsBitmap } = this.props;

    // add child container
    if (this.props.container) this.c = await this.props.container(renderer);

    // add children
    if (children) {
      const childRenderables = await children(renderer);
      this.children = childRenderables;

      if (childRenderables.length === 1) {
        this.r = childRenderables[0];
        this.c = childRenderables[0].c;
        await childRenderables[0]._init(renderer);
      } else {
        childRenderables.forEach(async (child) => {
          await child._init(renderer);
          this.c.addChild(child.c);
        });
      }
    }

    // set position
    if (position) this.c.position.set(position.x, position.y);

    // set id
    this.id = id ?? "";

    // TODO this should always be false (need to refactor buttons)
    // set interactive children false
    this.c.interactiveChildren = false;

    // set visible
    this.c.visible = visible ?? true;

    // set cacheAsBitmap
    this.c.cacheAsBitmap = cacheAsBitmap ?? false;

    // set container properties
    this.c.zIndex = this.props.zIndex || 0;
    this.c.sortableChildren = true;
    this.c.alpha = 1;
    this.c.children.forEach((child) => { child.alpha = 1 });
  }

  // cleanup MUST be called to correctly destroy the object
  cleanup = () => {
    this.renderer?.app.stage.removeChild(this.c); // remove from the renderer
    this.c.removeAllListeners(); // remove all event listeners
    this.c.destroy(); // remove from the world
  }
}
