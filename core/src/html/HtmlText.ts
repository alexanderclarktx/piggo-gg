import { CSS, HtmlDiv } from "@piggo-gg/core"

export type HtmlTextProps = {
  text?: string,
  style?: CSS
}

const defaults: HtmlTextProps["style"] = {
  position: "absolute",
  fontFamily: "Courier New",
  fontWeight: "bold",
  fontSize: "20px",
  textShadow: "2px 2px 1px rgba(0, 0, 0, 0.5)",
  pointerEvents: "none",
  alignItems: "center"
}

export const HtmlText = (props: HtmlTextProps): HtmlDiv => {
  const div = document.createElement("div")

  if (props.text) div.textContent = props.text

  Object.assign(div.style, defaults)
  Object.assign(div.style, props.style)

  return div
}

export const HtmlLabel = (text: string, left: number, top: number, visible = true) => HtmlText({
  text,
  style: {
    left: `${left}px`,
    top: `${top}px`,
    visibility: visible ? "visible" : "hidden",
    transform: "translate(-50%)"
  }
})
