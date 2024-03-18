import { Graphics, Text } from "pixi.js";
import { Renderable, RenderableProps } from "@piggo-gg/core";

export type ButtonProps = RenderableProps & {
  dims: { w: number, textX: number, textY: number },
  text: Text
}

export class Button<T extends ButtonProps = ButtonProps> extends Renderable {
  outline = new Graphics();
  shadow = new Graphics();

  dims: { w: number, textX: number, textY: number };
  text: Text;

  constructor(props: T) {
    super({
      ...props,
      interactiveChildren: true
    });
    this.text = props.text;
    this.dims = props.dims;
    this.initialStyle();
  }

  initialStyle = () => {
    // size and radius
    const width = this.dims.w;
    const height = 30;
    const radius = 10;

    // button outline
    this.outline.roundRect(0, 0, width, height, radius);
    this.outline.fill(0x000066);

    // button shadow
    const shadow = new Graphics();
    shadow.roundRect(0, -1, width, height, radius);
    shadow.fill({ color: 0xFFFF33, alpha: 0.3 });

    // add shadow to outline
    this.outline.addChild(shadow);
    this.c.addChild(this.outline);

    // button text
    this.text.position.set(Math.round(this.dims.textX), Math.round(this.dims.textY));
    this.c.addChild(this.text);
  }
}
