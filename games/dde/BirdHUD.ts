import { HtmlButton, SystemBuilder } from "@piggo-gg/core"

const BirdButton = (text: string, left: number, top: number, visible: boolean = true) => HtmlButton({
  text,
  style: {
    position: "absolute",
    left: `${left}px`,
    top: `${top}px`,
    width: "40px",
    height: "40px",
    fontSize: "26px",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    color: "#ffffff",
    border: "2px solid #ffffff",
    borderRadius: "8px",
    lineHeight: "18px",
    fontFamily: "Courier New",
    visibility: visible ? "visible" : "hidden"
  }
})

export const BirdHUD = SystemBuilder({
  id: "BirdHUD",
  init: (world) => {

    const height = world.three?.canvas.clientHeight || 600
    const top = height / 5 * 4
    const left = 100

    const aButton = BirdButton("A", left - 50, top)
    const dButton = BirdButton("D", left + 50, top)
    const sButton = BirdButton("S", left, top, false)
    const wButton = BirdButton("W", left, top - 50)
    const eButton = BirdButton("E", left, top - 150)

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
