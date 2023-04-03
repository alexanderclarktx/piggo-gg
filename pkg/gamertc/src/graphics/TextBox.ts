import { Text } from "pixi.js";
import { Renderable, RenderableProps } from "./Renderable";

export type TextBoxProps = RenderableProps & {
  text?: string;
  dynamic?: (text: Text) => void;
}

export class TextBox extends Renderable<TextBoxProps> {
  constructor(options: TextBoxProps & RenderableProps) {
    super(options);
    this.init();
  }

  init = () => {
    // initial text
    const text = new Text(this.props.text, { fill: 0x55FF00, fontSize: 16, dropShadow: true, dropShadowColor: 0x000000, dropShadowBlur: 0, dropShadowDistance: 2 });

    // dynamic text
    if (this.props.dynamic) {
      this.props.renderer.app.ticker.add(() => this.props.dynamic!(text));
    }

    this.addChild(text);
  }
}
