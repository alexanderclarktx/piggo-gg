import { XY } from "@piggo-gg/core"
import { Assets, Container, ContainerChild, Graphics, GraphicsContext, GraphicsOptions, Text } from "pixi.js"

export type pixiRectProps = { x: number, y: number, w: number, h: number, rounded?: number, style?: Omit<pixiStyleProps, "g"> }
export type pixiCircleProps = { x?: number, y?: number, r: number, style?: Omit<pixiStyleProps, "g"> }
export type pixiStyleProps = { g: Graphics, color?: number, alpha?: number, strokeColor?: number, strokeAlpha?: number, strokeWidth?: number }

export type pixiTextStyle = { fill?: number, fontSize?: number }
export type pixiTextProps = { text: string, anchor?: XY, pos?: XY, style?: pixiTextStyle }

export const pixiGraphics = (opts: GraphicsOptions | GraphicsContext = {}): Graphics => new Graphics(opts)

export const pixiRect = ({ x, y, w, h, rounded = 0, style }: pixiRectProps): Graphics => {
  const g = new Graphics()
  g.roundRect(x, y, w, h, rounded)

  return pixiStyle({ g, ...style })
}

export const pixiCircle = ({ x = 0, y = 0, r, style }: pixiCircleProps): Graphics => {
  const g = new Graphics()
  g.circle(x, y, r)

  return pixiStyle({ g, strokeWidth: 0, ...style })
}

export const pixiStyle = ({ g, color, alpha, strokeColor, strokeAlpha, strokeWidth }: pixiStyleProps): Graphics => {
  g.fill(
    { color: color ?? 0x000000, alpha: alpha ?? 0.4 }
  ).stroke(
    { width: strokeWidth ?? 2, color: strokeColor ?? color ?? 0xffffff, alpha: strokeAlpha ?? 0.9 }
  )
  return g
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
  })
}

export type PixiButtonProps = { content: () => { text: string, pos: XY, anchor: XY, style: pixiTextStyle }, onClick: () => void }
export type PixiButton = { c: Container, onClick: () => void, redraw: () => void }

export const PixiButton = (props: PixiButtonProps): PixiButton => {

  const draw = ({ text, pos, anchor, style, strokeAlpha }: { text: string, pos: XY, anchor: XY, style: pixiTextStyle, strokeAlpha?: number }) => {
    const t = pixiText({ text, pos, anchor, style })

    const b = pixiRect({
      x: pos.x - anchor.x * t.width - 3, y: pos.y - anchor.y * t.height - 3,
      w: t.width + 6, h: t.height + 6,
      rounded: 5,
      style: { alpha: 0, strokeAlpha: strokeAlpha ?? 1 }
    })

    return [b, t]
  }

  const c = new Container({ onpointerdown: props.onClick, children: draw(props.content()), interactive: true })

  return {
    c,
    onClick: props.onClick,
    redraw: () => {
      console.log("redraw", props.content().text)
      c.removeChildren()
      c.addChild(...draw(props.content()))
    }
  }
}

const textureCache: Record<string, Record<string, any>> = {}

export const loadTexture = async (file: string): Promise<Record<string, any>> => {
  const textures = (await Assets.load(file)).textures
  textureCache[file] = textures
  return textures
}

export const loadTextureCached = (file: string): Record<string, any> | undefined => {
  return textureCache[file]
}
