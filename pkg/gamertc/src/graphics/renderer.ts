import { Application, Container, settings, SCALE_MODES, BaseTexture } from 'pixi.js';

// Renderer renders the game to a canvas
export class Renderer {
  app: Application;

  // addContainer adds a container to the pixi.js stage
  addContainer = (container: Container) => {
    this.app.stage.addChild(container);
  }

  constructor(canvas: HTMLCanvasElement) {
    this.app = new Application({
      view: canvas,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      backgroundColor: 0x6495ed,
      width: 800,
      height: 600,
    });
    settings.ROUND_PIXELS = true;
    BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST;
  }
}
