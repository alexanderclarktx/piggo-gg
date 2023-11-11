import { Application, settings, SCALE_MODES, BaseTexture, utils } from "pixi.js";
import { Camera } from "@piggo-legends/core";
import { Position, Renderable } from "@piggo-legends/contrib";

// Renderer renders the game to a canvas
export class Renderer {
  canvas: HTMLCanvasElement;
  app: Application;
  camera: Camera;

  debug: boolean = false;
  events: utils.EventEmitter = new utils.EventEmitter();  

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    // create the pixi.js application
    this.app = new Application({
      view: canvas,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      backgroundColor: 0x6495ed,
      width: 800,
      height: 600,
      antialias: true,
    });

    // set up the camera
    this.camera = new Camera({ renderer: this });
    this.camera.c.addChild(this.app.stage);
    this.app.stage = this.camera.c;

    // global texture settings
    settings.ROUND_PIXELS = true;
    BaseTexture.defaultOptions.scaleMode = SCALE_MODES.LINEAR;

    // handle screen resize
    window.addEventListener("resize", () => {
      this.handleResize();
    });

    // handle fullscreen change
    document.addEventListener("fullscreenchange", () => {
      this.handleResize();
    });

    // prevent right-click
    canvas.addEventListener("contextmenu", (event) => {
      event.preventDefault();
    });
  }

  // handle screen resize
  handleResize = () => {
    if (document.fullscreenElement) {
      this.app.renderer.resize(window.innerWidth, window.innerHeight);
    } else {
      const computedCanvasStyle = window.getComputedStyle(this.canvas);
      const width = Math.min(parseInt(computedCanvasStyle.width), 800);
      const height = Math.min(parseInt(computedCanvasStyle.height), 600);
      this.app.renderer.resize(width, height);
    }
    this.camera.handleCameraPos();
  }

  // adds a Renderable to the pixi.js stage
  addWorld = (renderable: Renderable) => {
    this.camera.add(renderable);
    this.camera.handleCameraPos();
  }

  // method for tracking the camera
  trackCamera = (position: Position) => {
    this.app.ticker.add(() => {
      this.camera.moveTo(position.x, position.y);
    });
  }
}
