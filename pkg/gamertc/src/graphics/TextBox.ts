import { Text } from "pixi.js";
import { Renderable, RenderableProps } from "./Renderable";
import { Renderer } from "./Renderer";

export type TextBoxProps = {
  text?: string;
  dynamic?: (text: Text) => void;
}

export class TextBox extends Renderable {
  constructor(renderer: Renderer, options: TextBoxProps & RenderableProps) {
    super(renderer, options);

    // initial text
    const fpsText = new Text(options?.text, { fill: 0x55FF00, fontSize: 16, dropShadow: true, dropShadowColor: 0x000000, dropShadowBlur: 0, dropShadowDistance: 2 });

    // dynamic text
    if (options.dynamic) {
      this.renderer.app.ticker.add(() => options.dynamic!(fpsText));
    }

    this.addChild(fpsText);
  }
}
