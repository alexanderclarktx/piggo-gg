import { Graphics, Text } from "pixi.js";

export const pixiStyle = (g: Graphics) => g.fill({ color: 0x000000, alpha: 0.4 }).stroke({ width: 1, color: 0xffffff });

export const pixiText = ({ text, fontSize, pos }: { text: string, fontSize?: number, pos?: { x: number, y: number } }): Text => {
  const t = new Text({ text, style: { fill: 0xffffff, fontSize: fontSize ?? 12 } })
  if (pos) t.position.set(pos.x, pos.y);
  return t;
}
