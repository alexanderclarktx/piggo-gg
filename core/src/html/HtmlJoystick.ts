import { HtmlDiv, min, sqrt, XY } from "@piggo-gg/core"

export const HtmlJoystick = (): HTMLDivElement => {
  const stick = HtmlDiv({
    backgroundColor: "rgba(0, 100, 255, 0.5)",
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    left: "50%",
    top: "50%",
    pointerEvents: "auto",
    touchAction: "none",
    userSelect: "none",
    border: "2px solid #ffffff"
  })

  let dragging = false

  let center: XY = { x: 0, y: 0 }

  stick.oncontextmenu = (e) => {
    e.preventDefault()
  }

  stick.onpointerdown = (e) => {
    e.preventDefault()

    center = { x: stick.offsetLeft + e.offsetX, y: stick.offsetTop + e.offsetY }

    dragging = true
    stick.style.backgroundColor = "rgba(13, 27, 229, 0.8)"
  }

  stick.onpointermove = (e) => {
    if (!dragging) return

    const dx = e.clientX - center.x
    const dy = e.clientY - center.y
    const dist = min(30, sqrt(dx * dx + dy * dy))

    const angle = Math.atan2(dy, dx)
    const x = dist * Math.cos(angle)
    const y = dist * Math.sin(angle)

    stick.style.transform = `translate(${x}px, ${y}px)`
  }

  stick.onpointerup = () => {
    dragging = false

    stick.style.backgroundColor = "rgba(0, 100, 255, 0.5)"
    stick.style.transform = "translate(0, 0)"
  }

  return stick
}
