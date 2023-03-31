import { Application, Container, settings, SCALE_MODES, BaseTexture } from 'pixi.js';

// Renderer renders the game to a canvas
export class Renderer {
  app: Application;
  camera: Container;
  ogStage: Container;
  debug: boolean = false;

  // addContainer adds a container to the pixi.js stage
  addWorld = (container: Container) => {
    this.camera.addChild(container);
    container.position.x += this.camera.x;
    container.position.y += this.camera.y;
  }

  addHUD = (container: Container) => {
    container["cameraPosition"] = { x: container.x, y: container.y };
    this.app.stage.addChild(container);
  }

  // method for tracking the camera
  trackCamera = (container: Container) => {
    this.app.ticker.add(() => {
      // center the camera on the container
      const bounds = container.getBounds();
      this.camera.x = this.app.screen.width / 2 - container.x - bounds.width / 2;
      this.camera.y = this.app.screen.height / 2 - container.y - bounds.height / 2;

      // update positions of children that are fixed to the camera
      this.app.stage.children.forEach(child => {
        if (child["cameraPosition"]) {
          child.position.x = child["cameraPosition"].x - this.camera.x;
          child.position.y = child["cameraPosition"].y - this.camera.y;
        }
      });
    });
  }

  constructor(canvas: HTMLCanvasElement) {
    // create the pixi.js application
    this.app = new Application({
      view: canvas,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      backgroundColor: 0x6495ed,
      width: 800,
      height: 600,
    });

    // create the camera container
    this.camera = new Container();
    this.camera.addChild(this.app.stage);
    this.ogStage = this.app.stage;
    this.app.stage = this.camera;

    // global texture settings
    settings.ROUND_PIXELS = true;
    BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST;
  }
}
