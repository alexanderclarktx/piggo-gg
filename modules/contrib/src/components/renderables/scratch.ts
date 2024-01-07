import {
  Application,
  Container,
  Graphics,
  Renderer,
  Text,
  RenderTexture,
  Sprite,
  MSAA_QUALITY,
  Matrix
} from "pixi.js"

const app = new Application({
  resizeTo: window,
  autoDensity: true,
  antialias: true,
  autoStart: false,
  backgroundColor: 0x333333,
  resolution: window.devicePixelRatio
});
// document.body.appendChild(app.view);

const templateShape = new Graphics()
  .beginFill(0xffffff)
  .lineStyle({ width: 1, color: 0x333333, alignment: 0 })
  .drawCircle(0, 0, 20);

const { width, height } = templateShape;

// Draw the circle to the RenderTexture
const renderTexture = RenderTexture.create({
  width,
  height,
  multisample: MSAA_QUALITY.HIGH,
  resolution: window.devicePixelRatio
});
// With the existing renderer, render texture
// make sure to apply a transform Matrix
app.renderer.render(templateShape, {
  renderTexture,
  transform: new Matrix(1, 0, 0, 1, width / 2, height / 2)
});

// Required for MSAA, WebGL 2 only
(app.renderer as Renderer).framebuffer.blit();

// Discard the original Graphics
templateShape.destroy(true);

class Shape extends Sprite {
  speed: number = 0;
}

const shapes: Shape[] = [];
for (let i = 0; i < 1000; i++) {
  const shape = new Shape(renderTexture);
  shapes[i] = shape;

  shape.anchor.set(0.5);
  shape.speed = 1 + Math.random() * 1.2;
  shape.position.x = app.screen.width * Math.random();
  shape.position.y = app.screen.height * Math.random();

  shape.tint = parseInt(Math.floor(Math.random() * 16777215).toString(16), 16);
}

const container = new Container();
container.addChild(...shapes);

const text = new Text("", {
  fill: "white",
  fontWeight: "bold",
  fontSize: 16
});
text.position.set(10);
app.stage.addChild(container, text);

const redraw = () => {
  let startTime = performance.now();
  for (let i = 0; i < shapes.length; i++) {
    const shape = shapes[i];
    shape.position.x += shape.speed;
    if (shape.position.x > app.screen.width + width) {
      shape.position.x -= app.screen.width + width + width;
    }
  }
  text.text =
    "Prepared: " +
    Math.round(performance.now() - startTime) +
    "ms, Points: n/a";
  app.render();

  requestAnimationFrame(redraw);
};

requestAnimationFrame(redraw);
