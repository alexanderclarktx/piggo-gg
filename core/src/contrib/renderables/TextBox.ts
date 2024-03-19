import { Graphics, Text } from "pixi.js";
import { Renderable, RenderableProps } from "@piggo-gg/core";

export type TextBoxProps = RenderableProps & {
  text?: string
  fontSize?: number
  color?: number
  dropShadow?: boolean
  padding?: number
  boxOutline?: boolean
}

export const TextBox = (props: TextBoxProps): Renderable => {

  const { text = "", color = 0x55FF00, fontSize = 16, dropShadow = false, padding = 0, boxOutline = false } = props;

  return new Renderable({
    ...props,
    setup: async (r: Renderable) => {
      const textContainer = new Text({
        text,
        style: {
          fill: color,
          fontSize,
          dropShadow,
          padding
        }
      })

      if (boxOutline) {
        const bg = new Graphics()
        bg.rect(0, 0, 200, 100);
        bg.fill({ color: 0xffffff, alpha: 0.3 });
        textContainer.addChild(bg);
      }

      r.c = textContainer;
    }
  });
}
