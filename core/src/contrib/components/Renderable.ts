import { AnimatedSprite, Assets, Container } from "pixi.js";
import { Component, Entity, World, Renderer } from "@piggo-gg/core";

export type RenderableProps = {
  setContainer?: (r: Renderer) => Promise<Container>
  setChildren?: (r: Renderer) => Promise<Renderable[]>
  dynamic?: (c: Container, r: Renderable, e: Entity, w: World) => void
  interactiveChildren?: boolean
  position?: { x: number; y: number }
  zIndex?: number
  visible?: boolean
  scale?: number,
  anchor?: { x: number, y: number }
  color?: number
  scaleMode?: "nearest" | "linear"
  cacheAsBitmap?: boolean
  rotates?: boolean
  animations?: Record<string, AnimatedSprite>
  setup?: (renderable: Renderable, renderer: Renderer | undefined) => Promise<void>
}

export class Renderable extends Component<"renderable"> {
  type: "renderable" = "renderable";

  animations: Record<string, AnimatedSprite>;
  animation: AnimatedSprite | undefined;
  bufferedAnimation = "";
  activeAnimation = "";

  c: Container = new Container();

  scale: number;
  rotates: boolean;
  zIndex: number;
  color: number;
  scaleMode: "nearest" | "linear";
  interactiveChildren: boolean;

  anchor: { x: number; y: number };
  position: { x: number; y: number };
  
  r: Renderable | undefined;
  renderer: Renderer | undefined;
  children: Renderable[] | undefined;

  setContainer: undefined | ((r: Renderer) => Promise<Container>);
  setChildren: undefined | ((r: Renderer) => Promise<Renderable[]>);
  setup: undefined | ((renderable: Renderable, renderer: Renderer | undefined) => Promise<void>);
  dynamic: undefined | ((c: Container, r: Renderable, e: Entity, w: World) => void);

  override data = {
    visible: true
  }

  constructor(props: RenderableProps) {
    super();
    this.animations = props.animations ?? {};
    this.position = props.position ?? { x: 0, y: 0 };
    this.rotates = props.rotates ?? false;
    this.scale = props.scale ?? 1;
    this.data.visible = props.visible ?? true;
    this.zIndex = props.zIndex ?? 0;
    this.color = props.color ?? 0xffffff;
    this.interactiveChildren = props.interactiveChildren ?? false;
    this.setContainer = props.setContainer ?? undefined;
    this.setChildren = props.setChildren ?? undefined;
    this.anchor = props.anchor ?? { x: 0.5, y: 0.5 };
    this.scaleMode = props.scaleMode ?? "linear";
    this.setup = props.setup ?? undefined;
    this.position = props.position ?? { x: 0, y: 0 };
    this.dynamic = this.overrideDynamic(props.dynamic ?? undefined);
  }

  overrideDynamic = (dynamic: undefined | ((c: Container, r: Renderable, e: Entity, w: World) => void)) => {
    return (c: Container, r: Renderable, e: Entity, w: World) => {
      if (dynamic) dynamic(c, r, e, w);
      if (this.data.visible !== this.c.visible) this.c.visible = this.data.visible;
    }
  }

  loadTextures = async (file: string): Promise<Record<string, any>> => {
    return (await Assets.load(file)).textures;
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
    this.c.visible = this.data.visible ?? true;

    // set container properties
    this.c.zIndex = this.zIndex || 0;
    this.c.sortableChildren = true;
    this.c.alpha = 1;
    this.c.children.forEach((child) => { child.alpha = 1 });

    if (this.animations) this.prepareAnimations(this.color ?? 0xffffff)
  }

  // MUST be called to correctly destroy the object
  cleanup = () => {
    // remove from the renderer
    this.renderer?.app.stage.removeChild(this.c);

    // remove all event listeners
    this.c.removeAllListeners();

    this.c.visible = false;

    // remove from the world
    // this.c.destroy(); // TODO disabled because it breaks from collider debug
  }
}
