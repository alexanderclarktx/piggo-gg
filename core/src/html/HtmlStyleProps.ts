export type HtmlStyleProps = {
  alignItems?: "center" | "flex-start" | "flex-end" | "stretch"
  backgroundColor?: `#${string}` | `rgba(${number}, ${number}, ${number}, ${number})`
  border?: string
  borderImage?: `linear-gradient(${string}) ${number}`
  borderRadius?: `${number}px` | `${number}%`
  clipPath?: string
  color?: `#${string}`
  cursor?: "pointer" | "default" | "not-allowed"
  display?: "block" | "inline-block" | "flex" | "inline-flex" | "none"
  fontFamily?: "Courier New" | "Arial"
  fontSize?: `${number}px`
  fontWeight?: "normal" | "bold" | "bolder" | "lighter"
  height?: `${number}px` | `${number}%`
  justifyContent?: "center" | "flex-start" | "flex-end" | "space-between" | "space-around"
  left?: `${number}%` | `${number}px`
  lineHeight?: `${number}px`
  margin?: `${number}px` | `${number}%`
  marginTop?: `${number}px` | `${number}%`
  overflow?: "visible" | "hidden" | "scroll" | "auto"
  padding?: string
  pointerEvents?: "none" | "auto"
  position?: "absolute" | "relative" | "fixed" | "sticky" | "static"
  right?: `${number}%` | `${number}px`
  scrollbarWidth?: "auto" | "thin" | "none"
  textAlign?: "left" | "center" | "right" | "justify"
  textShadow?: `${number}px ${number}px ${number}px rgba(${number}, ${number}, ${number}, ${number})`
  top?: `${number}%` | `${number}px`
  transform?: string
  visibility?: "visible" | "hidden"
  width?: `${number}px` | `${number}%`
  zIndex?: number
}
