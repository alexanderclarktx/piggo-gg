import { Application, Graphics } from 'pixi.js'
import '@pixi/unsafe-eval';
import React, { useEffect, useState } from 'react';

export const Game = () => {

  const [app, setApp] = useState<Application | null>(null);
  const [graphics, setGraphics] = useState<Graphics | null>(null);

  useEffect(() => {
    const app = new Application({
      view: document.getElementById("canvas") as HTMLCanvasElement,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      backgroundColor: 0x6495ed,
      width: 800,
      height: 600
    });

    setApp(app);

    const graphics = new Graphics();
    setGraphics(graphics);
    graphics.beginFill(0xFF00FF);
    graphics.lineStyle(10, 0x00FF00);
    graphics.drawCircle(200, 200, 25);
    graphics.endFill();

    app.stage.addChild(graphics);
  }, []);

  return (
    <div id="game"></div>
  );
}
