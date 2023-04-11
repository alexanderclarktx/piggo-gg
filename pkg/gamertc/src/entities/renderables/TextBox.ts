import { Text } from "pixi.js";
import { Renderable, RenderableProps } from "../../core/ecs/Renderable";

export type TextBoxProps = RenderableProps & {
  initialText?: string,
  fontSize?: number,
  color?: number,
  dynamic?: (text: Text) => void
}

export class TextBox extends Renderable<TextBoxProps> {
  text: Text;

  constructor(props: TextBoxProps & RenderableProps) {
    super({
      ...props,
      debuggable: props.debuggable || false
    });
    this.init();
  }

  init = () => {
    // initial text
    this.text = new Text(this.props.initialText, {
      fill: this.props.color || 0x55FF00,
      fontSize: this.props.fontSize || 16,
      dropShadow: false
    });

    // dynamic text
    if (this.props.dynamic) {
      this.props.renderer.app.ticker.add(this.updateText);
    }

    this.addChild(this.text);
  }

  updateText = () => {
    if (this.props.dynamic) {
      this.props.dynamic(this.text);
    }
  }

  override destroy = () => {
    if (this.props.dynamic) {
      this.props.renderer.app.ticker.remove(this.updateText);
    }
    super.destroy();
  }
}
