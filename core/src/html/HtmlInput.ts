import { HtmlText, CSS, HtmlDiv } from "@piggo-gg/core"

const defaults: CSS = {
  fontSize: "18px",
  lineHeight: "40px",
  position: "relative",
  pointerEvents: "auto",
  textAlign: "center"
}

export type HtmlInputProps = {
  text?: string
  style?: CSS
  handler?: (value: string) => string
}

export const HtmlInput = (props: HtmlInputProps = {}): HtmlDiv => {
  const div = HtmlText(props)

  div.contentEditable = "true"
  div.inputMode = "text"
  div.spellcheck = false

  Object.assign(div.style, defaults)
  Object.assign(div.style, props.style)

  div.addEventListener("keydown", (e: KeyboardEvent) => {
    if (["Escape", "Enter"].includes(e.key)) {
      e.preventDefault()

      if (props.handler) {
        div.textContent = props.handler(div.textContent ?? "")
      }

      div.blur()
    }
  })

  return div
}
