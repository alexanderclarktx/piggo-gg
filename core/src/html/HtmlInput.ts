import { HtmlText, CSS, HtmlDiv } from "@piggo-gg/core"

const defaults: CSS = {
  fontSize: "18px",
  lineHeight: "40px",
  position: "relative",
  pointerEvents: "auto"
}

export const HtmlInput = (style: CSS = {}): HtmlDiv => {
  const div = HtmlText()

  div.contentEditable = "true"
  div.inputMode = "text"

  Object.assign(div.style, defaults)
  Object.assign(div.style, style)

  div.addEventListener("keydown", (e: KeyboardEvent) => {
    if (["Escape", "Enter"].includes(e.key)) {
      e.preventDefault()
      div.blur()
    }
  })

  return div
}
