import { Assets, Graphics, Text } from "pixi.js";

export type pixiRectProps = { x: number, y: number, w: number, h: number, style?: Omit<pixiStyleProps, "g"> };
export type pixiCircleProps = { x: number, y: number, r: number, style?: Omit<pixiStyleProps, "g"> };
export type pixiStyleProps = { g: Graphics, color?: number, strokeColor?: number, alpha?: number };

export type pixiTextStyle = { fill?: number, fontSize?: number };
export type pixiTextProps = { text: string, anchor?: { x: number, y: number }, pos?: { x: number, y: number }, style?: pixiTextStyle };

export const pixiRect = ({ x, y, w, h, style }: pixiRectProps): Graphics => {
  const g = new Graphics();
  g.rect(x, y, w, h);

  return pixiStyle({ g, ...style });
}

export const pixiCircle = ({ x, y, r, style }: pixiCircleProps): Graphics => {
  const g = new Graphics();
  g.circle(x, y, r);

  return pixiStyle({ g, ...style });
}

export const pixiStyle = ({ g, color, alpha, strokeColor }: pixiStyleProps): Graphics => {
  g.fill({ color: color ?? 0x000000, alpha: alpha ?? 0.4 }).stroke({ width: 1, color: strokeColor ?? color ?? 0xffffff });
  return g;
}

export const pixiText = ({ text, pos, style, anchor }: pixiTextProps): Text => {
  return new Text({
    text,
    anchor: anchor ?? 0,
    position: pos ?? { x: 0, y: 0 },
    resolution: 2,
    style: {
      fill: style?.fill ?? 0xffffff,
      fontSize: style?.fontSize ?? 14
    }
  });
}

export const loadTexture = async (file: string): Promise<Record<string, any>> => {
  return (await Assets.load(file)).textures;
}
