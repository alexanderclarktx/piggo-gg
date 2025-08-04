import { abs, HtmlDiv, max, sqrt, XY } from "@piggo-gg/core"

export const HtmlJoystick = (): HTMLDivElement => {
  const stick = HtmlDiv({
    backgroundColor: "rgba(0, 0, 255, 0.5)",
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    left: "50%",
    top: "50%",
    pointerEvents: "auto",
    // touchAction: "none"
  })

  let dragging = false

  let offsetX = 50
  let offsetY = 50

  let center: XY = { x: 0, y: 0 }

  stick.onpointerdown = (e) => {
    // e.preventDefault()

    center = { x: stick.offsetLeft, y: stick.offsetTop }
    console.log("center", center)

    console.log("pointer down")

    dragging = true
    stick.style.backgroundColor = "rgba(0, 0, 255, 0.8)"

    const rect = stick.getBoundingClientRect()
    // const offsetX = e.clientX - rect.left
    // const offsetY = e.clientY - rect.top
  }

  stick.onpointermove = (e) => {
    if (!dragging) return

    const dx = e.clientX - center.x
    const dy = e.clientY - center.y
    const dist = max(50, sqrt(dx * dx + dy * dy))

    const angle = Math.atan2(dy, dx)
    const x = dist * Math.cos(angle)
    const y = dist * Math.sin(angle)

    stick.style.transform = `translate(${x - offsetX}px, ${y - offsetY}px)`
  }

  stick.onpointerup = () => {
    dragging = false
    stick.style.backgroundColor = "rgba(0, 0, 255, 0.5)"
    stick.style.left = "50%"
    stick.style.top = "50%"
  }

  return stick
}
