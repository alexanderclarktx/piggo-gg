import { HtmlText, CSS, HtmlDiv } from "@piggo-gg/core"

const defaults: CSS = {
  fontSize: "18px",
  lineHeight: "40px",
  position: "relative",
  pointerEvents: "auto"
}

export type HtmlInputProps = {
  text?: string
  style?: CSS
}

export const HtmlInput = (props: HtmlInputProps = {}): HtmlDiv => {
  const div = HtmlText(props)

  div.contentEditable = "true"
  div.inputMode = "text"

  Object.assign(div.style, defaults)
  Object.assign(div.style, props.style)

  div.addEventListener("keydown", (e: KeyboardEvent) => {
    if (["Escape", "Enter"].includes(e.key)) {
      e.preventDefault()
      div.blur()
    }
  })

  return div
}
