import { Text } from "pixi.js";
import { Renderable, RenderableProps } from "@piggo-legends/core";

export type TextBoxProps = RenderableProps & {
  text?: string
  fontSize?: number
  color?: number
  dropShadow?: boolean
  padding?: number
}

export class TextBox extends Renderable<TextBoxProps> {
  constructor(props: TextBoxProps) {
    const { text = "", color = 0x55FF00, fontSize = 16, dropShadow = false, padding = 0 } = props;

    super({
      ...props,
      container: async () => new Text(text, {
        fill: color,
        fontSize,
        dropShadow,
        padding
      }),
    });
  }
}
