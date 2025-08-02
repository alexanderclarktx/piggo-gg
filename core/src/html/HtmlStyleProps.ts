export type HtmlStyleProps = {
  alignItems?: "center" | "flex-start" | "flex-end" | "stretch"
  borderImage?: `linear-gradient(${string}) ${number}`
  backgroundColor?: `#${string}` | `rgba(${number}, ${number}, ${number}, ${number})`
  border?: string
  borderRadius?: `${number}px` | `${number}%`
  color?: `#${string}`
  cursor?: "pointer" | "default" | "not-allowed"
  display?: "block" | "inline-block" | "flex" | "inline-flex" | "none"
  fontFamily?: "Courier New" | "Arial" | "Verdana" | "Times New Roman" | "Georgia" | "Tahoma" | "Trebuchet MS"
  fontSize?: `${number}px`
  fontWeight?: "normal" | "bold" | "bolder" | "lighter"
  height?: `${number}px` | `${number}%`
  justifyContent?: "center" | "flex-start" | "flex-end" | "space-between" | "space-around"
  left?: `${number}%` | `${number}px`
  right?: `${number}%` | `${number}px`
  lineHeight?: `${number}px`
  padding?: string
  pointerEvents?: "none" | "auto"
  position?: "absolute" | "relative" | "fixed" | "sticky" | "static"
  textShadow?: `${number}px ${number}px ${number}px rgba(${number}, ${number}, ${number}, ${number})`
  top?: `${number}%` | `${number}px`
  transform?: string
  visibility?: "visible" | "hidden"
  width?: `${number}px` | `${number}%`
  zIndex?: number
  clipPath?: string
}
