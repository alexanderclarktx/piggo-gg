import { Application, settings, SCALE_MODES, BaseTexture, utils, Text, DisplayObject } from "pixi.js";
import { Renderable, RenderableProps } from "../ecs/Renderable";
import { TextBox } from "../../entities/renderables/TextBox";

// Renderer renders the game to a canvas
export class Renderer {

  canvas: HTMLCanvasElement;
  app: Application;
  camera: Renderable<any> = new Renderable({renderer: this, debuggable: false});
  debug: boolean = false;
  events: utils.EventEmitter = new utils.EventEmitter();
  debugRenderables: Renderable<RenderableProps>[] = [];

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
      antialias: true
    });

    // set up the camera
    this.camera.addChild(this.app.stage);
    this.app.stage = this.camera;

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

    this.events.on("debug", this.handleDebug);
  }

  handleDebug = () => {
    if (this.debug) {
      this.camera.children.forEach((child: DisplayObject) => {
        if (child instanceof Renderable && child.debugGraphics) {
          // text position at top right of the bounding box
          const textBox = new TextBox({
            renderer: this,
            dynamic: (text: Text) => {
              const bounds = child.getBounds(false);
              textBox.position.set(child.x - 15, bounds.y - this.camera.y - 15);
              text.text = `${child.x},${child.y}`;
            },
            fontSize: 12,
            color: 0xffff00,
            debuggable: false
          });
          this.debugRenderables.push(textBox);
          this.addWorld(textBox);
        }
      });
    } else {
      for (const renderable of this.debugRenderables) {
        renderable.destroy();
      }
    }
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
  }

  // adds a Renderable to the pixi.js stage
  addWorld = (renderable: Renderable<any>) => {
    this.camera.addChild(renderable);
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
      this.camera.x = +(this.app.screen.width / 2 - renderable.x).toFixed(2);
      this.camera.y = +(this.app.screen.height / 2 - renderable.y).toFixed(2);

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
