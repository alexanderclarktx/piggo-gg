import { Graphics, Text } from "pixi.js";
import { Renderable } from "./Renderable";
import { Renderer } from "./Renderer";

export type ButtonProps = {
  dims: {x: number, y: number, w: number, lx: number, ly: number},
  text: Text,
  onPress: () => void,
  onDepress: () => void
}

export class Button extends Renderable {
  clicked = false;
  outline = new Graphics();
  shadow = new Graphics();

  constructor(renderer: Renderer, {dims, text, onPress, onDepress}: ButtonProps) {
    super(renderer);

    this.position.set(dims.x, dims.y);
    this.interactive = true;

    this.initialStyle(dims, text);

    this.on("pointerdown", () => {
      if (this.clicked) {
        onDepress();
        this.styleOnDepress();
      } else {
        onPress();
        this.styleOnPress();
      }
      this.clicked = !this.clicked;
    });
  }

  initialStyle = (dims: ButtonProps["dims"], text: ButtonProps["text"]) => {
    // size and radius
    const width = dims.w;
    const height = 30;
    const radius = 10;

    // button outline
    this.outline.beginFill(0x000066);
    this.outline.drawRoundedRect(0, 0, width, height, radius);
    this.outline.endFill();

    // button shadow
    const shadow = new Graphics();
    shadow.beginFill(0xFFFF33, 0.3);
    shadow.drawRoundedRect(0, -1, width, height, radius);
    shadow.endFill();

    // add shadow to outline
    this.outline.addChild(shadow);
    this.addChild(this.outline);

    // button text
    text.position.set(dims.lx, dims.ly);
    this.addChild(text);
  }

  styleOnPress = () => {
    this.shadow.tint = 0x000000;
  }

  styleOnDepress = () => {
    this.shadow.tint = 0xFFFFFF;
  }
}
