import { HtmlStyleProps } from "@piggo-gg/core"

const defaults: HtmlStyleProps = {
  position: "absolute"
}

export const HtmlDiv = (style: HtmlStyleProps = {}): HTMLDivElement => {
  const div = document.createElement("div")

  Object.assign(div.style, defaults)
  Object.assign(div.style, style)

  div.oncontextmenu = (e) => e.preventDefault()

  return div
}
