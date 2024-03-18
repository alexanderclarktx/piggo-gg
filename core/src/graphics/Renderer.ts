import { Application } from "pixi.js";
import { Camera, Renderable } from "@piggo-gg/core";

export type RendererProps = {
  canvas: HTMLCanvasElement;
  width?: number;
  height?: number;
}

// Renderer draws the game to a canvas
export class Renderer {
  props: RendererProps;

  app: Application;
  camera: Camera;

  constructor(props: RendererProps) {
    this.props = props;

    this.app = new Application();

    // this.init()
  }

  async init() {

    // create the pixi.js application
    await this.app.init({
      view: this.props.canvas,
      resolution: 2, // TODO configurable
      autoDensity: true,
      backgroundColor: 0x6495ed,
      width: this.props.width ?? 800,
      height: this.props.height ?? 600,
      antialias: false,
      hello: true,
      roundPixels: false
    });

    // set up the camera
    this.camera = new Camera(this);
    this.camera.c.addChild(this.app.stage);
    this.app.stage = this.camera.c;

    // hide the cursor
    this.app.renderer.events.cursorStyles.default = "none";

    // handle screen resize
    window.addEventListener("resize", this.handleResize);

    // handle fullscreen change
    document.addEventListener("fullscreenchange", this.handleResize);

    // prevent right-click
    this.props.canvas.addEventListener("contextmenu", (event) => event.preventDefault());
  }

  handleResize = () => {
    if (document.fullscreenElement && this.app.renderer) {
      this.app.renderer.resize(window.innerWidth, window.innerHeight);
    } else {
      const computedCanvasStyle = window.getComputedStyle(this.props.canvas);
      const width = Math.min(parseInt(computedCanvasStyle.width), this.props.width ?? 800);
      const height = Math.min(parseInt(computedCanvasStyle.height), this.props.height ?? 600);
      this.app.renderer.resize(width, height);
    }
  }

  addWorld = (renderable: Renderable) => {
    this.camera.add(renderable);
  }
}
