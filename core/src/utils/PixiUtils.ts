import {
  AnimatedSprite, AnimatedSpriteFrames, Assets, Container, Graphics,
  GraphicsContext, GraphicsOptions, Text, TextStyleFontWeight
} from "pixi.js"
import { XY } from "@piggo-gg/core"

export type pixiRectProps = { x: number, y: number, w: number, h: number, rounded?: number, style?: Omit<pixiStyleProps, "g"> }
export type pixiCircleProps = { x?: number, y?: number, r: number, style?: Omit<pixiStyleProps, "g"> }
export type pixiStyleProps = { g: Graphics, color?: number, alpha?: number, strokeColor?: number, strokeAlpha?: number, strokeWidth?: number }

export type pixiTextStyle = {
  align?: "left" | "center" | "right"
  alpha?: number
  dropShadow?: boolean
  fill?: number
  fontFamily?: string
  fontSize?: number
  fontWeight?: TextStyleFontWeight
  resolution?: number
}
export type pixiTextProps = { text: string, anchor?: XY, pos?: XY, style?: pixiTextStyle }

export const pixiContainer = (): Container => new Container()

export const pixiAnimation = (frames: AnimatedSpriteFrames) => new AnimatedSprite(frames)

export const pixiGraphics = (opts: GraphicsOptions | GraphicsContext = {}): Graphics => new Graphics(opts)

export const pixiRect = ({ x, y, w, h, rounded = 0, style }: pixiRectProps): Graphics => {
  const g = new Graphics()
  g.roundRect(x, y, w, h, rounded)

  return pixiStyle({ g, ...style })
}

export const pixiCircle = ({ x = 0, y = 0, r, style }: pixiCircleProps): Graphics => {
  const g = pixiGraphics().circle(x, y, r)
  return pixiStyle({ g, strokeWidth: 0, ...style })
}

export const pixiStyle = ({ g, color, alpha, strokeColor, strokeAlpha, strokeWidth }: pixiStyleProps): Graphics => {
  return g.fill({
    color: color ?? 0x000000,
    alpha: alpha ?? 0.4
  }).stroke({
    width: strokeWidth ?? 2,
    color: strokeColor ?? 0xffffff,
    alpha: strokeAlpha ?? 0.9
  })
}

export const pixiText = ({ text, pos, style, anchor }: pixiTextProps): Text => {
  return new Text({
    text,
    anchor: anchor ?? 0,
    position: pos ?? { x: 0, y: 0 },
    resolution: style?.resolution ?? 4,
    alpha: style?.alpha ?? 1,
    style: {
      align: style?.align ?? "left",
      fill: style?.fill ?? 0xffffff,
      fontSize: style?.fontSize ?? 14,
      fontFamily: style?.fontFamily ?? "Courier New",
      fontWeight: style?.fontWeight ?? "bold",
      dropShadow: style?.dropShadow ? { distance: 0.5 } : false
    }
  })
}

export type PixiButtonProps = {
  content: () => { text: string, pos: XY, width?: number, anchor?: XY, style: pixiTextStyle, strokeAlpha?: number, alpha?: number, fillColor?: number },
  onClick?: () => void
  onEnter?: () => void
  onLeave?: () => void
}

export type PixiButton = { c: Container, onClick: undefined | (() => void), redraw: () => void }

export const PixiButton = (props: PixiButtonProps): PixiButton => {

  const draw = (props: { text: string, pos: XY, width?: number, anchor?: XY, style: pixiTextStyle, strokeAlpha?: number, alpha?: number, fillColor?: number }) => {

    props.anchor = props.anchor ?? { x: 0.5, y: 0 }

    const t = pixiText({
      text: props.text,
      pos: props.pos,
      anchor: props.anchor,
      style: props.style
    })

    const b = pixiRect({
      x: props.width ? props.pos.x - props.width / 2 : props.pos.x - props.anchor.x * t.width - 7,
      y: props.pos.y - props.anchor.y * t.height - 5,
      w: props.width ?? t.width + 14, h: t.height + 10,
      rounded: 5,
      style: { alpha: props.alpha ?? 0, strokeAlpha: props.strokeAlpha ?? 0, color: props.fillColor ?? 0x000000 }
    })

    return [b, t]
  }

  const c = new Container({
    children: draw(props.content()),
    interactive: true,
    ...props.onClick && { onpointerdown: props.onClick },
    ...props.onEnter && { onpointerenter: props.onEnter },
    ...props.onLeave && { onpointerleave: props.onLeave }
  })

  return {
    c,
    onClick: props.onClick,
    redraw: () => {
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
