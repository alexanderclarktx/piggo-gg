import { HtmlStyleProps } from "@piggo-gg/core"

export const HtmlButton = (props: HtmlButtonProps): HTMLButtonElement => {
  const b = document.createElement("button")

  if (props.text) b.textContent = props.text

  if (props.onClick || props.onRelease) b.style.pointerEvents = "auto"
  if (props.onClick) b.addEventListener("pointerdown", props.onClick)
  if (props.onRelease) b.addEventListener("pointerup", props.onRelease)
  if (props.onHover) b.addEventListener("pointerover", props.onHover)
  if (props.onHoverOut) b.addEventListener("pointerout", props.onHoverOut)

  b.oncontextmenu = (e) => e.preventDefault()

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
  onClick?: (event: MouseEvent) => void
  onRelease?: (event: MouseEvent) => void
  onHover?: (event: MouseEvent) => void
  onHoverOut?: (event: MouseEvent) => void
}
