import { Application, Graphics } from 'pixi.js';

// renderer uses PIXI.js to render the game
export class Renderer {
  app: Application;

  constructor(canvas: HTMLCanvasElement) {
    this.app = new Application({
      view: canvas,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      backgroundColor: 0x6495ed,
      width: 800,
      height: 600
    });

    const graphics = new Graphics();
    graphics.beginFill(0xFF00FF);
    graphics.lineStyle(10, 0x00FF00);
    graphics.drawCircle(200, 200, 25);
    graphics.endFill();

    this.app.stage.addChild(graphics);
  }
}
