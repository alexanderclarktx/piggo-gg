import { Graphics, Text } from "pixi.js";
import { Renderable, RenderableProps } from "@piggo-legends/core";

export type ButtonProps = RenderableProps & {
  dims: {w: number, textX: number, textY: number},
  text: Text,
  onPress: () => void,
  onDepress: () => void // TODO just use one callback
}

export class Button extends Renderable<ButtonProps> {
  clicked = false;
  outline = new Graphics();
  shadow = new Graphics();

  constructor(props: ButtonProps) {
    super({
      ...props,
      debuggable: props.debuggable || false
    });
    this.init();
  }

  init = () => {
    this.c.eventMode = "static";

    this.initialStyle();

    this.c.on("pointerdown", this.handleClick);
  }

  handleClick = () => {
    if (this.clicked) {
      this.props.onDepress();
      this.styleOnDepress();
    } else {
      this.props.onPress();
      this.styleOnPress();
    }
    this.clicked = !this.clicked;
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
    this.c.addChild(this.outline);

    // button text
    this.props.text.position.set(Math.round(this.props.dims.textX), Math.round(this.props.dims.textY));
    this.c.addChild(this.props.text);
  }

  styleOnPress = () => {
    this.shadow.tint = 0xff0000;
    this.outline.tint = 0xff0000;
  }

  styleOnDepress = () => {
    this.shadow.tint = 0x00FFFF;
    this.outline.tint = 0x00FFFF;
  }
}
