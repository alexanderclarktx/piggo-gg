import { abs, HtmlDiv, max, min, sqrt, XY } from "@piggo-gg/core"

export const HtmlJoystick = (): HTMLDivElement => {
  const stick = HtmlDiv({
    backgroundColor: "rgba(0, 0, 255, 0.5)",
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    left: "50%",
    top: "50%",
    pointerEvents: "auto",
    touchAction: "none",
    userSelect: "none",
    // touchAction: "none"
  })

  let dragging = false

  let center: XY = { x: 0, y: 0 }

  let offsetX = 0
  let offsetY = 0

  stick.oncontextmenu = (e) => {
    e.preventDefault()
  }

  stick.onpointerdown = (e) => {
    e.preventDefault()

    offsetX = e.offsetX - 50
    offsetY = e.offsetY - 50

    center = { x: stick.offsetLeft + 50, y: stick.offsetTop + 50 }

    // center = { x: stick.offsetLeft + dx, y: stick.offsetTop + dy }
    console.log("offsetX", offsetX, "offsetY", offsetY)

    dragging = true
    stick.style.backgroundColor = "rgba(0, 0, 255, 0.8)"

    // const rect = stick.getBoundingClientRect()
    // const offsetX = e.clientX - rect.left
    // const offsetY = e.clientY - rect.top
  }

  stick.onpointermove = (e) => {
    if (!dragging) return

    const dx = e.clientX - center.x
    const dy = e.clientY - center.y
    const dist = min(30, sqrt(dx * dx + dy * dy))

    const angle = Math.atan2(dy, dx)
    const x = dist * Math.cos(angle)
    const y = dist * Math.sin(angle)

    console.log("dx", dx, "dy", dy, "dist", dist, "x", x, "y", y)

    stick.style.transform = `translate(${x}px, ${y}px)`
  }

  stick.onpointerup = () => {
    dragging = false
    stick.style.backgroundColor = "rgba(0, 0, 255, 0.5)"
    stick.style.transform = "translate(0, 0)"
  }

  return stick
}
