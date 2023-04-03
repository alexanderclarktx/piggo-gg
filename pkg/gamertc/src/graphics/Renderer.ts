import { Application, settings, SCALE_MODES, BaseTexture, utils } from "pixi.js";
import { Renderable } from "./Renderable";

// Renderer renders the game to a canvas
export class Renderer {

  canvas: HTMLCanvasElement;
  app: Application;
  camera: Renderable<any> = new Renderable({renderer: this, debuggable: false});
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
    });

    // set up the camera
    this.camera.addChild(this.app.stage);
    this.app.stage = this.camera;

    // global texture settings
    settings.ROUND_PIXELS = true;
    BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST;

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
      this.app.renderer.resize(screen.width, screen.height);
    } else {
      const computedCanvasStyle = window.getComputedStyle(this.canvas);
      const width = Math.min(parseInt(computedCanvasStyle.width), 800);
      const height = Math.min(parseInt(computedCanvasStyle.height), 600);
      this.app.renderer.resize(width, height);
    }
  }

  // adds a Renderable to the pixi.js stage
  addWorld = (renderable: Renderable<any>) => {
    this.camera.addChild(renderable);
    renderable.position.x += this.camera.x;
    renderable.position.y += this.camera.y;
  }

  // adds a Renderable to a fixed position on the screen
  addHUD = (renderable: Renderable<any>) => {
    renderable["cameraPosition"] = { x: renderable.x, y: renderable.y };
    this.camera.addChild(renderable);
  }

  // method for tracking the camera
  trackCamera = (renderable: Renderable<any>) => {
    this.app.ticker.add(() => {
      // center the camera on the renderable
      this.camera.x = Math.round(this.app.screen.width / 2 - renderable.x);
      this.camera.y = Math.round(this.app.screen.height / 2 - renderable.y);

      // update positions of children that are fixed to the camera
      this.camera.children.forEach(child => {
        if (child["cameraPosition"]) {
          child.position.x = child["cameraPosition"].x - this.camera.x;
          child.position.y = child["cameraPosition"].y - this.camera.y;
        }
      });
    });
  }
}
