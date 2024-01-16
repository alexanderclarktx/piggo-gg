import { Graphics, Text } from "pixi.js";
import { Renderable, RenderableProps } from "@piggo-legends/contrib";

export type ButtonProps = RenderableProps & {
  dims: { w: number, textX: number, textY: number },
  text: Text
}

export class Button<T extends ButtonProps = ButtonProps> extends Renderable<T> {
  outline = new Graphics();
  shadow = new Graphics();

  constructor(props: T) {
    super({
      ...props,
      interactiveChildren: true
    });
    this.initialStyle();
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
}
