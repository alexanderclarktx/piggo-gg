import { Component, Entity, Renderer, World, XY } from "@piggo-gg/core";
import { AnimatedSprite, Container } from "pixi.js";

export type RenderableProps = {
  anchor?: XY
  animations?: Record<string, AnimatedSprite>
  cacheAsBitmap?: boolean
  color?: number
  animationColor?: number
  interactiveChildren?: boolean
  interpolate?: boolean
  position?: { x: number; y: number }
  rotates?: boolean
  scale?: number,
  scaleMode?: "nearest" | "linear"
  visible?: boolean
  zIndex?: number
  dynamic?: (c: Container, r: Renderable, e: Entity, w: World) => void
  setChildren?: (r: Renderer) => Promise<Renderable[]>
  setContainer?: (r: Renderer) => Promise<Container>
  setup?: (renderable: Renderable, renderer: Renderer) => Promise<void>
}

export class Renderable extends Component<"renderable"> {
  type: "renderable" = "renderable";

  activeAnimation = "";
  anchor: { x: number; y: number };
  animation: AnimatedSprite | undefined;
  animations: Record<string, AnimatedSprite>;
  bufferedAnimation = "";
  c: Container = new Container();
  children: Renderable[] | undefined;
  animationColor: number;
  color: number;
  interactiveChildren: boolean;
  interpolate: boolean;
  position: { x: number; y: number };
  r: Renderable | undefined;
  rendered: boolean = false;
  renderer: Renderer;
  rotates: boolean;
  scale: number;
  scaleMode: "nearest" | "linear";
  visible: boolean;
  zIndex: number;

  setContainer: undefined | ((r: Renderer) => Promise<Container>);
  setChildren: undefined | ((r: Renderer) => Promise<Renderable[]>);
  setup: undefined | ((renderable: Renderable, renderer: Renderer) => Promise<void>);
  dynamic: undefined | ((c: Container, r: Renderable, e: Entity, w: World) => void);

  constructor(props: RenderableProps) {
    super();
    this.anchor = props.anchor ?? { x: 0.5, y: 0.5 };
    this.animations = props.animations ?? {};
    this.animationColor = props.animationColor ?? 0xffffff;
    this.color = props.color ?? 0xffffff;
    this.dynamic = this.overrideDynamic(props.dynamic ?? undefined);
    this.interactiveChildren = props.interactiveChildren ?? false;
    this.interpolate = props.interpolate ?? false;
    this.position = props.position ?? { x: 0, y: 0 };
    this.rotates = props.rotates ?? false;
    this.scale = props.scale ?? 1;
    this.scaleMode = props.scaleMode ?? "linear";
    this.setChildren = props.setChildren ?? undefined;
    this.setContainer = props.setContainer ?? undefined;
    this.setup = props.setup ?? undefined;
    this.visible = props.visible ?? true;
    this.zIndex = props.zIndex ?? 0;
  }

  overrideDynamic = (dynamic: undefined | ((c: Container, r: Renderable, e: Entity, w: World) => void)) => {
    return (c: Container, r: Renderable, e: Entity, w: World) => {
      if (dynamic) dynamic(c, r, e, w);
      if (this.c.renderable !== this.visible) this.c.renderable = this.visible;
    }
  }

  setAnimation = (animationKey: string) => {
    if (Object.values(this.animations).length && this.animations[animationKey]) {
      this.bufferedAnimation = animationKey;
    }
  }

  prepareAnimations = (color: number) => {
    Object.values(this.animations).forEach((animation: AnimatedSprite) => {
      animation.animationSpeed = 0.1;
      animation.scale.set(this.scale);
      animation.anchor.set(this.anchor.x, this.anchor.y);
      animation.texture.source.scaleMode = this.scaleMode;
      animation.tint = color;
    });
    this.bufferedAnimation = Object.keys(this.animations)[0];
  }

  _init = async (renderer: Renderer | undefined) => {
    if (!renderer) return;
    this.renderer = renderer;

    // add child container
    if (this.setContainer && renderer) this.c = await this.setContainer(renderer);

    // add children
    if (this.setChildren && renderer) {
      const childRenderables = await this.setChildren(renderer);
      this.children = childRenderables;

      childRenderables.forEach(async (child) => {
        await child._init(renderer);
        this.c.addChild(child.c);
      });
    }

    if (this.setup) await this.setup(this, renderer);

    // set position
    this.c.position.set(this.position.x, this.position.y);

    // set interactive children
    this.interactiveChildren ? this.c.interactiveChildren = true : this.c.interactiveChildren = false;

    // set visible
    this.c.renderable = this.visible ?? true;

    // set container properties
    this.c.zIndex = this.zIndex || 0;
    this.c.sortableChildren = true;
    this.c.alpha = 1;
    this.c.children.forEach((child) => { child.alpha = 1 });

    this.c.tint = this.color;

    if (this.animations) this.prepareAnimations(this.animationColor ?? 0xffffff)
  }

  // MUST be called to correctly destroy the object
  cleanup = () => {
    // remove from the renderer
    this.renderer?.app.stage.removeChild(this.c);
    this.renderer?.camera.c.removeChild(this.c);

    // remove all event listeners
    this.c.removeAllListeners();

    this.c.renderable = false;
    this.visible = false;

    // remove from the world
    // this.c.destroy(); // TODO disabled because it breaks debug mode
  }
}
