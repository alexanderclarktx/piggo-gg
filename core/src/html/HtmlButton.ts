export type HtmlButtonProps = {
  text?: string
  style?: {
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
    height?: `${number}px`
    justifyContent?: "center" | "flex-start" | "flex-end" | "space-between" | "space-around"
    left?: `${number}%` | `${number}px`
    lineHeight?: `${number}px`
    padding?: string
    position?: "absolute" | "relative" | "fixed" | "sticky" | "static"
    textShadow?: `${number}px ${number}px ${number}px rgba(${number}, ${number}, ${number}, ${number})`
    top?: `${number}%` | `${number}px`
    transform?: string
    visibility?: "visible" | "hidden"
    width?: `${number}px`
    zIndex?: number
    clipPath?: string
  }
}

const defaults: HtmlButtonProps["style"] = {
  position: "absolute",
  fontFamily: "Courier New",
  fontWeight: "bold",
  textShadow: "2px 2px 1px rgba(0, 0, 0, 0.5)"
  // clipPath: "inset(0 round 3px)"
}

export const HtmlButton = (props: HtmlButtonProps): HTMLButtonElement => {
  const b = document.createElement('button')

  if (props.text) b.textContent = props.text

  Object.assign(b.style, defaults)
  Object.assign(b.style, props.style)

  return b
}

export const HtmlDiv = (props: HtmlButtonProps): HTMLDivElement => {
  const div = document.createElement('div')

  if (props.text) div.textContent = props.text

  Object.assign(div.style, defaults)
  Object.assign(div.style, props.style)

  return div
}
