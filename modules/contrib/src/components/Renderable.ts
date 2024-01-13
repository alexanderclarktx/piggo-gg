import { Container, SCALE_MODES } from "pixi.js";
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
  rotates?: boolean
  // scaleMode?: "nearest" | "linear"
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

  constructor(props: T = {} as T) {
    this.props = { ...props, debuggable: props.debuggable ?? false, rotates: props.rotates ?? false }
  }

  _init = async (renderer: Renderer) => {
    this.renderer = renderer;

    const { children, position, id, visible, cacheAsBitmap, container, zIndex } = this.props;

    // add child container
    if (container) this.c = await container(renderer);

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

    // if (scaleMode) { this.c.scaleMode = (scaleMode === "nearest" ? SCALE_MODES.NEAREST : SCALE_MODES.LINEAR) }

    // set position
    if (position) this.c.position.set(position.x, position.y);

    // set id
    this.id = id ?? "";

    // set interactive children false
    this.c.interactiveChildren = false;

    // set visible
    this.c.visible = visible ?? true;

    // set cacheAsBitmap
    this.c.cacheAsBitmap = cacheAsBitmap ?? false;

    // set container properties
    this.c.zIndex = zIndex || 0;
    this.c.sortableChildren = true;
    this.c.alpha = 1;
    this.c.children.forEach((child) => { child.alpha = 1 });
  }

  // MUST be called to correctly destroy the object
  cleanup = () => {
    // remove from the renderer
    this.renderer?.app.stage.removeChild(this.c);

    // remove all event listeners
    this.c.removeAllListeners();

    // remove from the world
    this.c.destroy();
  }
}
