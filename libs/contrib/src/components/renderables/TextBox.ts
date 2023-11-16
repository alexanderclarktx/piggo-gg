import { Text } from "pixi.js";
import { Renderable, RenderableProps } from "@piggo-legends/contrib";

export type TextBoxProps = RenderableProps & {
  text?: string,
  fontSize?: number,
  color?: number
}

export class TextBox extends Renderable<TextBoxProps> {
  constructor(props: TextBoxProps) {
    super({
      ...props,
      debuggable: props.debuggable || false,
      container: new Text(props.text, {
        fill: props.color || 0x55FF00,
        fontSize: props.fontSize || 16,
        dropShadow: false
      })
    });
  }
}
