import { HtmlStyleProps } from "@piggo-gg/core"

export const HtmlButton = (props: HtmlButtonProps): HTMLButtonElement => {
  const b = document.createElement('button')

  if (props.text) b.textContent = props.text

  Object.assign(b.style, defaults)
  Object.assign(b.style, props.style)

  return b
}

const defaults: HtmlStyleProps = {
  position: "absolute",
  fontFamily: "Courier New",
  fontWeight: "bold",
  textShadow: "2px 2px 1px rgba(0, 0, 0, 0.5)",
  pointerEvents: "none"
  // clipPath: "inset(0 round 3px)"
}

export type HtmlButtonProps = {
  text?: string,
  style: HtmlStyleProps
}

export const HtmlDiv = (style: HtmlStyleProps = {}): HTMLDivElement => {
  const div = document.createElement('div')

  Object.assign(div.style, defaults)
  Object.assign(div.style, style)

  return div
}
