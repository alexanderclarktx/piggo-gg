import { Client, HtmlDiv, localAim, min, sqrt, XY } from "@piggo-gg/core"

export const HtmlJoystick = (client: Client, side: "left" | "right"): HTMLDivElement => {

  const idle = side === "left" ? "rgba(244, 251, 44, 0.5)" : "rgba(0, 100, 255, 0.5)"
  const active = side === "left" ? "rgba(236, 243, 13, 0.8)" : "rgba(0, 100, 255, 0.8)"

  const stick = HtmlDiv({
    ...side === "left" ? { left: "80px" } : { right: "80px" },
    backgroundColor: idle,
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    bottom: "50px",
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
    stick.style.backgroundColor = active
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

    if (side === "left") {
      client.analog.left = { power: dist / 30, angle: angle, active: true }
    } else {
      client.analog.right = { power: dist / 30, angle: angle, active: true }
    }
  }

  stick.onpointerup = () => {
    dragging = false

    stick.style.backgroundColor = idle
    stick.style.transform = "translate(0, 0)"

    if (side === "left") {
      client.analog.left = { power: 0, angle: 0, active: false }
    } else {
      client.analog.right = { power: 0, angle: 0, active: false }
    }
  }

  return stick
}
