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
  backgroundColor: "rgba(0, 0, 0, 0.3)",
  color: "#ffffff",
  pointerEvents: "none",
  border: "2px solid #ffffff",
  borderRadius: "8px",
  transform: "translateX(-50%)"
}

export type HtmlButtonProps = {
  text?: string
  style?: HtmlStyleProps
}
