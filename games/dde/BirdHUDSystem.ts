import { HtmlButton, HtmlText, SystemBuilder } from "@piggo-gg/core"
import { DDEState } from "./DDE"

export const BirdHUDSystem = SystemBuilder({
  id: "BirdHUDSystem",
  init: (world) => {

    const width = world.three?.canvas.clientWidth || 800
    const height = world.three?.canvas.clientHeight || 600

    const top = height / 5 * 4
    const left = 100

    const aButton = SmallButton("A", left - 50, top)
    const dButton = SmallButton("D", left + 50, top)
    const sButton = SmallButton("S", left, top, false)
    const wButton = SmallButton("W", left, top - 50)
    const eButton = SmallButton("E", left, top - 150)

    const transformLabel = HtmlText({
      text: "transform",
      style: {
        left: `${left + 20}px`,
        top: `${top - 100}px`,
        fontSize: "20px",
        color: "#ffffff",
        position: "absolute",
        transform: "translateX(-50%)"
      }
    })

    const moveLabel = HtmlText({
      text: "move",
      style: {
        left: `${left + 20}px`,
        top: `${top + 50}px`,
        fontSize: "20px",
        color: "#ffffff",
        position: "absolute",
        transform: "translateX(-50%)"
      }
    })

    const scoreText = HtmlText({
      text: "Score: 0",
      style: {
        left: `${width / 2}px`,
        top: `${20}px`,
        fontSize: "24px",
        color: "#ffffff",
        position: "absolute",
        transform: "translateX(-50%)",
      }
    })

    world.three?.canvas.parentElement?.append(
      aButton, sButton, wButton, dButton, eButton,
      transformLabel, moveLabel,
      scoreText
    )

    const active = "rgba(0, 255, 255, 0.6)"
    const inactive = "rgba(0, 0, 0, 0.3)"

    let currentApplesEaten = 0

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
        if (pc) {
          sButton.style.visibility = pc.components.position.data.flying ? "hidden" : "visible"
        }

        const state = world.game.state as DDEState
        const pcApplesEaten = state.applesEaten[world.client?.playerId() || ""] || 0

        if (pcApplesEaten !== currentApplesEaten) {
          currentApplesEaten = pcApplesEaten
          scoreText.textContent = `Score: ${currentApplesEaten}`
        }
      }
    }
  }
})

const SmallButton = (text: string, left: number, top: number, visible: boolean = true) => HtmlButton({
  text,
  style: {
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
    visibility: visible ? "visible" : "hidden"
  }
})
