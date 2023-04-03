import { Graphics, Text } from "pixi.js";
import { Renderable, RenderableProps } from "./Renderable";

export type ButtonProps = RenderableProps & {
  dims: {w: number, textX: number, textY: number},
  text: Text,
  onPress: () => void,
  onDepress: () => void
}

export class Button extends Renderable<ButtonProps> {
  clicked = false;
  outline = new Graphics();
  shadow = new Graphics();

  constructor(options: ButtonProps) {
    super(options);
    this.init();
  }

  init = () => {
    this.interactive = true;

    this.initialStyle();

    this.on("pointerdown", () => {
      if (this.clicked) {
        this.props.onDepress();
        this.styleOnDepress();
      } else {
        this.props.onPress();
        this.styleOnPress();
      }
      this.clicked = !this.clicked;
    });
  }

  initialStyle = () => {
    // size and radius
    const width = this.props.dims.w;
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
    this.props.text.position.set(this.props.dims.textX, this.props.dims.textY);
    this.addChild(this.props.text);
  }

  styleOnPress = () => {
    this.shadow.tint = 0x000000;
  }

  styleOnDepress = () => {
    this.shadow.tint = 0xFFFFFF;
  }
}
