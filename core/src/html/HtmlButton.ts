import { CSS } from "@piggo-gg/core"

export type HtmlButton = HTMLButtonElement

export const HtmlButton = (props: HtmlButtonProps): HtmlButton => {
  const b = document.createElement("button")
  Object.assign(b.style, defaults)

  if (props.text) b.textContent = props.text

  if (props.onClick || props.onRelease) b.style.pointerEvents = "auto"
  if (props.onClick) b.addEventListener("pointerdown", props.onClick)
  if (props.onRelease) b.addEventListener("pointerup", props.onRelease)
  if (props.onHover) b.addEventListener("pointerover", props.onHover)
  if (props.onHoverOut) b.addEventListener("pointerout", props.onHoverOut)

  b.oncontextmenu = (e) => e.preventDefault()
  b.ontouchstart = (e) => e.preventDefault()
  b.ontouchend = (e) => e.preventDefault()
  b.ontouchmove = (e) => e.preventDefault()
  b.ontouchcancel = (e) => e.preventDefault()

  Object.assign(b.style, props.style)

  return b
}

const defaults: CSS = {
  position: "absolute",
  fontFamily: "Courier New",
  fontWeight: "bold",
  fontSize: "20px",
  textShadow: "2px 2px 1px rgba(0, 0, 0, 0.5)",
  backgroundColor: "rgba(0, 0, 0, 0.4)",
  color: "#ffffff",
  pointerEvents: "none",
  border: "2px solid #ffffff",
  borderRadius: "8px"
}

export type HtmlButtonProps = {
  text?: string
  style?: CSS
  onClick?: (event: MouseEvent) => void
  onRelease?: (event: MouseEvent) => void
  onHover?: (event: MouseEvent) => void
  onHoverOut?: (event: MouseEvent) => void
}

export const styleButton = (button: HtmlButton, active: boolean, hovered: boolean): void => {
  if (active) {
    button.style.border = "2px solid #ffffff"
    button.style.color = "#ffffff"
    button.style.backgroundColor = hovered ? "rgba(0, 50, 150, 0.7)" : "rgba(0, 0, 0, 0.4)"
  } else {
    button.style.border = "2px solid #cccccc"
    button.style.color = "#cccccc"
    button.style.backgroundColor = "rgba(0, 0, 0, 0)"
  }
}

export const styleSwitch = (button: HtmlButton, enabled: boolean, hovered: boolean): void => {
  if (enabled) {
    button.textContent = "on"
    button.style.border = "2px solid #00ff00"
    button.style.color = "#00ff00"
    button.style.backgroundColor = hovered ? "rgba(0, 160, 200, 0.4)" : "rgba(0, 0, 0, 0.4)"
  } else {
    button.textContent = "off"
    button.style.border = "2px solid #ff0000"
    button.style.color = "#ff0000"
    button.style.backgroundColor = hovered ? "rgba(0, 160, 255, 0.4)" : "rgba(0, 0, 0, 0.4)"
  }
}
