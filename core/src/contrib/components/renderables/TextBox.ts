import { Graphics, HTMLText } from "pixi.js";
import { Renderable, RenderableProps } from "@piggo-legends/core";

export type TextBoxProps = RenderableProps & {
  text?: string
  fontSize?: number
  color?: number
  dropShadow?: boolean
  padding?: number
  boxOutline?: boolean
}

export class TextBox extends Renderable {

  constructor(props: TextBoxProps) {
    const { text = "", color = 0x55FF00, fontSize = 16, dropShadow = false, padding = 0, boxOutline = false } = props;

    const textContainer = new HTMLText(text, {
      fill: color,
      fontSize,
      dropShadow,
      padding
    })

    if (boxOutline) {
      const bg = new Graphics()
      bg.beginFill(0xffffff, 0.3);
      bg.drawRect(0, 0, 200, 100);
      bg.endFill();
      textContainer.addChild(bg);
    }

    super({
      ...props,
      container: async () => textContainer
    });
  }
}
