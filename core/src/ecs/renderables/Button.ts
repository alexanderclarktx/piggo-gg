import { Graphics, Text } from "pixi.js";
import { Renderable, RenderableProps } from "@piggo-gg/core";

export type ButtonProps = RenderableProps & {
  dims: { w: number, textX: number, textY: number },
  text: Text
}

export const Button = <T extends ButtonProps = ButtonProps>(props: T): Renderable => {
  const dims = props.dims;
  let text: Text;

  return new Renderable({
    ...props,
    interactiveChildren: true,
    setup: async (r: Renderable) => {

      // size and radius
      const width = dims.w;
      const height = 30;
      const radius = 10;

      // button outline
      const outline = new Graphics();
      outline.roundRect(0, 0, width, height, radius);
      outline.fill(0x000066);

      // button shadow
      const shadow = new Graphics();
      shadow.roundRect(0, -1, width, height, radius);
      shadow.fill({ color: 0xFFFF33, alpha: 0.3 });

      // add shadow to outline
      outline.addChild(shadow);
      r.c.addChild(outline);

      // button text
      text = props.text;
      text.position.set(Math.round(dims.textX), Math.round(dims.textY));
      r.c.addChild(text);
    }
  })
}
