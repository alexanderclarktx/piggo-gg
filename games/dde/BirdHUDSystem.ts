import { HtmlButton, HtmlLabel, HtmlText, SystemBuilder } from "@piggo-gg/core"
import { DDEState } from "./DDE"

export const BirdHUDSystem = SystemBuilder({
  id: "BirdHUDSystem",
  init: (world) => {

    const width = world.three?.canvas.clientWidth || 800
    const height = world.three?.canvas.clientHeight || 600

    const top = height / 5 * 3
    const left = 120

    const aButton = KeyButton({ text: "A", left: left - 50, top })
    const dButton = KeyButton({ text: "D", left: left + 50, top })
    const sButton = KeyButton({ text: "S", left, top, visible: false })
    const wButton = KeyButton({ text: "W", left, top: top - 50 })
    const eButton = KeyButton({ text: "E", left, top: top - 150 })

    const boostButton = KeyButton({ text: "shift", left, top: top + 110, width: 120 })

    const transformLabel = HtmlLabel("transform", left, top - 100)
    const moveLabel = HtmlLabel("move", left, top + 50)
    const boostLabel = HtmlLabel("boost", left, top + 160)

    const scoreText = HtmlText({
      text: "score: 0",
      style: {
        left: `${width / 2}px`,
        top: `${height - 50}px`,
        fontSize: "28px",
        color: "#ffffff",
        transform: "translateX(-50%)",
      }
    })

    world.three?.canvas.parentElement?.append(
      aButton, sButton, wButton, dButton, eButton,
      boostButton,
      transformLabel, moveLabel, boostLabel,
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
        boostButton.style.backgroundColor = down.includes("shift") ? active : inactive

        const pc = world.client?.playerCharacter()
        if (pc) sButton.style.visibility = pc.components.position.data.flying ? "hidden" : "visible"

        const state = world.game.state as DDEState
        const pcApplesEaten = state.applesEaten[world.client?.playerId() || ""] || 0

        if (pcApplesEaten !== currentApplesEaten) {
          currentApplesEaten = pcApplesEaten
          scoreText.textContent = `score: ${currentApplesEaten}`
        }
      }
    }
  }
})

type KeyButtonProps = {
  text: string
  left: number
  top: number
  visible?: boolean
  width?: number
}

const KeyButton = (props: KeyButtonProps) => HtmlButton({
  text: props.text,
  style: {
    left: `${props.left}px`,
    top: `${props.top}px`,
    width: `${props.width ?? 40}px`,
    height: "40px",
    fontSize: "26px",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    color: "#ffffff",
    border: "2px solid #ffffff",
    borderRadius: "8px",
    lineHeight: "18px",
    visibility: props.visible === false ? "hidden" : "visible",
    transform: "translateX(-50%)"
  }
})
