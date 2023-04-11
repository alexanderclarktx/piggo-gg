import { Container, Graphics, Rectangle, Sprite, Text } from "pixi.js";
import { Renderer } from "../game/Renderer";
import { TextBox } from "../../entities/renderables/TextBox";

export type RenderableProps = {
  renderer: Renderer,
  debuggable?: boolean,
  pos?: { x: number; y: number },
  timeout?: number,
  zIndex?: number
}

export class Renderable<T extends RenderableProps> extends Container {
  id: string;
  debugGraphics: Graphics | undefined;
  props: T;

  constructor(props: T) {
    super();
    this.props = props;
    this._init();
  }

  _init = () => {
    this.position.set(this.props.pos?.x || 0, this.props.pos?.y || 0);
    this.zIndex = this.props.zIndex || 0;
    this.sortableChildren = true;

    // debug outline
    if (!(this.props.debuggable === false)) {
      this.debugGraphics = new Graphics();
      // debug graphics
      this.addChild(this.debugGraphics);
      this.debugGraphics.visible = this.props.renderer.debug;

      // debug graphics callbacks
      this.on("childAdded", this.updateDebugGraphics);
      this.props.renderer.events.on("debug", this.updateDebugGraphics);
    }

    // set a timeout
    if (this.props.timeout) {
      setTimeout(() => {
        this._destroy();
      }, this.props.timeout);
    }
  }

  _destroy = () => {
    // remove from the renderer
    this.props.renderer.camera.removeChild(this);

    // remove from the world
    super.destroy();

    // remove all event listeners
    this.removeAllListeners();
    this.props.renderer.events.removeListener("debug", this.updateDebugGraphics);
  }

  updateDebugGraphics = () => {
    if (this.debugGraphics) {
      this.debugGraphics.visible = this.props.renderer.debug;

      // update alpha for all sprites in this container
      for (const child of this.children) {
        if (child instanceof Sprite) {
          child.alpha = this.props.renderer.debug ? 0.5 : 1;
        }
      }

      // draw a rectangle around the container
      const bounds = this.getLocalBounds();
      this.debugGraphics.clear();
      this.debugGraphics.lineStyle(1, 0xFF0000);
      this.debugGraphics.drawRect(bounds.x + 1, bounds.y + 1, bounds.width - 2, bounds.height - 2);

      // draw a circle at origin
      this.debugGraphics.lineStyle(1, 0x00FF00, 0.9);
      this.debugGraphics.drawCircle(0, 0, 2);

      // draw a circle at pivot
      this.debugGraphics.lineStyle(1, 0xFF00FF, 0.9);
      this.debugGraphics.drawCircle(this.pivot.x, this.pivot.y, 2);
    }
  }
}
