import { Application, Container, Text, Graphics } from 'pixi.js';

// renderer uses PIXI.js to render the game
export class Renderer {
  app: Application;

  addContainer = (container: Container) => {
    this.app.stage.addChild(container);
    this.app.ticker.add(() => {
      // console.log("abc");
    });
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

    // this.app.ticker

    // this.app.ticker.maxFPS = 60;
    // this.app.ticker.minFPS = 60;
  }
}
