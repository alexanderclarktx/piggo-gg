import { Entity, Game, Renderer, System } from "@piggo-legends/gamertc";
import { Container, Text } from "pixi.js";

export class Pong extends Game {

  constructor(renderer: Renderer) {
    super(renderer);

    // container
    const container = new Container();
    container.y = 5;
    container.x = renderer.app.screen.width - 35;

    // fps ticker
    const fpsText = new Text();
    fpsText.style = { fill: 0xFFFF11, fontSize: 16 };
    fpsText.text = "Hello World";
    renderer.app.ticker.add(() => {
      fpsText.text = Math.round(renderer.app.ticker.FPS);
    });

    // add to container
    container.addChild(fpsText);

    renderer.addContainer(container);
  }

  render = () => {
    console.log("Rendering the game");
  }

  // const graphics = new Graphics();
  //   graphics.beginFill(0xFF00FF);
  //   graphics.lineStyle(10, 0x00FF00);
  //   graphics.drawCircle(0, 50, 25);
  //   graphics.endFill();

  //   this.app.ticker.add(() => {
  //     container.rotation += 0.01;
  //   });
  //   // graphics.onmouseover = (event: FederatedPointerEvent) => {
  //   //   console.log("Clicked", event);
  //   // };

  //   this.app.stage.addChild(container);
}
