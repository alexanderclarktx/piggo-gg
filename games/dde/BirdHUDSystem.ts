import { HtmlButton, SystemBuilder } from "@piggo-gg/core"

export const BirdHUDSystem = SystemBuilder({
  id: "BirdHUDSystem",
  init: (world) => {

    const height = world.three?.canvas.clientHeight || 600
    const top = height / 5 * 4
    const left = 100

    const aButton = SmallButton("A", left - 50, top)
    const dButton = SmallButton("D", left + 50, top)
    const sButton = SmallButton("S", left, top, false)
    const wButton = SmallButton("W", left, top - 50)
    const eButton = SmallButton("E", left, top - 150)

    world.three?.canvas.parentElement?.append(aButton, sButton, wButton, dButton, eButton)

    const active = "rgba(0, 255, 255, 0.6)"
    const inactive = "rgba(0, 0, 0, 0.3)"

    return {
      id: "BirdHUDSystem",
      query: [],
      priority: 10,
      onTick: () => {
        const down = world.client?.bufferDown.all()?.map(key => key.key)
        if (!down) return

        aButton.style.backgroundColor = down.includes("a") ? active : inactive
        dButton.style.backgroundColor = down.includes("d") ? active : inactive
        sButton.style.backgroundColor = down.includes("s") ? active : inactive
        wButton.style.backgroundColor = down.includes("w") ? active : inactive
        eButton.style.backgroundColor = down.includes("e") ? active : inactive

        const pc = world.client?.playerCharacter()
        if (!pc) return

        sButton.style.visibility = pc.components.position.data.flying ? "hidden" : "visible"
      }
    }
  }
})

const SmallButton = (text: string, left: number, top: number, visible: boolean = true) => HtmlButton({
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
