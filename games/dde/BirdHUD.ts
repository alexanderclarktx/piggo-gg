import { HtmlButton, HtmlButtonProps, SystemBuilder } from "@piggo-gg/core"

const HUDStyle = {
  position: "absolute",
  padding: "10px",
  fontSize: "26px",
  backgroundColor: "rgba(0, 0, 0, 0.3)",
  color: "#ffffff",
  border: "2px solid #ffffff",
  borderRadius: "8px",
  width: "40px",
  height: "40px",
  lineHeight: "18px",
  fontFamily: "Courier New",
} as HtmlButtonProps["style"]

export const BirdHUD = SystemBuilder({
  id: "BirdHUD",
  init: (world) => {

    const height = world.three?.canvas.clientHeight || 600
    const top = height / 5 * 4
    const left = 100

    const aButton = HtmlButton({
      text: "A",
      style: { top: `${top}px`, left: `${left - 50}px`, ...HUDStyle }
    })
    const dButton = HtmlButton({
      text: "D",
      style: { top: `${top}px`, left: `${left + 50}px`, ...HUDStyle }
    })
    const sButton = HtmlButton({
      text: "S",
      style: { top: `${top}px`, left: `${left}px`, ...HUDStyle }
    })
    const wButton = HtmlButton({
      text: "W",
      style: { top: `${top - 50}px`, left: `${left}px`, ...HUDStyle }
    })
    const eButton = HtmlButton({
      text: "E",
      style: { top: `${top - 150}px`, left: `${left}px`, ...HUDStyle }
    })

    world.three?.canvas.parentElement?.append(aButton, sButton, wButton, dButton, eButton)

    return {
      id: "BirdHUD",
      query: [],
      priority: 10,
      onTick: () => {
        const down = world.client?.bufferDown.all()?.map(key => key.key)
        if (!down) return

        aButton.style.backgroundColor = down.includes("a") ? "rgba(0, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.3)"
        dButton.style.backgroundColor = down.includes("d") ? "rgba(0, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.3)"
        sButton.style.backgroundColor = down.includes("s") ? "rgba(0, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.3)"
        wButton.style.backgroundColor = down.includes("w") ? "rgba(0, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.3)"
        eButton.style.backgroundColor = down.includes("e") ? "rgba(0, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.3)"

        const pc = world.client?.playerCharacter()
        if (!pc) return

        sButton.style.visibility = pc.components.position.data.flying ? "hidden" : "visible"
      }
    }
  }
})
