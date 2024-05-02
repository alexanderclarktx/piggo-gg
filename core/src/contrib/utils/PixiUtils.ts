import { Assets, Graphics, Text } from "pixi.js";

export type pixiRectProps = { x: number, y: number, w: number, h: number, style?: pixiStyleProps };
export type pixiStyleProps = { g: Graphics, color?: number, alpha?: number };
export type pixiTextProps = { text: string, fontSize?: number, pos?: { x: number, y: number } };

export const pixiRect = ({x, y, w, h, style}: Omit<pixiRectProps, "g">): Graphics => {
  const g = new Graphics();
  g.rect(x, y, w, h);

  return pixiStyle({ g, ...style });
}

export const pixiStyle = ({ g, color, alpha }: pixiStyleProps): Graphics => {
  g.fill({ color: color ?? 0x000000, alpha: alpha ?? 0.4 }).stroke({ width: 1, color: 0xffffff });
  return g;
}

export const pixiText = ({ text, fontSize, pos }: pixiTextProps): Text => {
  const t = new Text({ text, style: { fill: 0xffffff, fontSize: fontSize ?? 12 } })
  if (pos) t.position.set(pos.x, pos.y);
  return t;
}

export const loadTexture = async (file: string): Promise<Record<string, any>> => {
  return (await Assets.load(file)).textures;
}
