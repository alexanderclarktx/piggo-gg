import { HtmlText, CSS, HtmlDiv } from "@piggo-gg/core"

const defaults: CSS = {
  fontSize: "18px",
  lineHeight: "40px"
}

export const HtmlInput = (style: CSS = {}): HtmlDiv => {
  const div = HtmlText()

  div.contentEditable = "true"
  div.inputMode = "text"

  Object.assign(div.style, defaults)
  Object.assign(div.style, style)

  return div
}
