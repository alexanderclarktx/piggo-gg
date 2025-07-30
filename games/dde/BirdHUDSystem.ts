import {
  HtmlMusic, HtmlButton, HtmlLabel, HtmlText, SystemBuilder
} from "@piggo-gg/core"
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

    const boostButton = KeyButton({ text: "shift", left, top: top + 100, width: 120 })
    const jumpButton = KeyButton({ text: "spacebar", left, top: top + 200, width: 160, visible: false })

    const transformLabel = HtmlLabel("transform", left, top - 100)
    const moveLabel = HtmlLabel("move", left, top + 50)
    const boostLabel = HtmlLabel("boost", left, top + 150)
    const jumpLabel = HtmlLabel("jump", left, top + 250, false)

    const scoreText = HtmlText({
      text: "",
      style: {
        left: `50%`,
        top: `${height - 50}px`,
        fontSize: "28px",
        color: "#ffffff",
        transform: "translateX(-50%)",
      }
    })

    const posText = HtmlText({
      text: "0|0|0",
      style: {
        left: `50%`,
        top: `${height - 100}px`,
        fontSize: "24px",
        color: "#00ffff",
        transform: "translateX(-50%)"
      }
    })

    const music = HtmlMusic()

    world.three?.canvas.parentElement?.append(
      aButton, sButton, wButton, dButton, eButton,
      boostButton, jumpButton,
      transformLabel, moveLabel, boostLabel, jumpLabel,
      scoreText, posText, music
    )

    const active = "rgba(0, 255, 255, 0.6)"
    const inactive = "rgba(0, 0, 0, 0.3)"

    let currentApplesEaten = -1

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
        jumpButton.style.backgroundColor = down.includes(" ") ? active : inactive

        const pc = world.client?.playerCharacter()
        if (pc) {
          const { position } = pc.components

          const visibility = position.data.flying ? "hidden" : "visible"

          sButton.style.visibility = visibility
          jumpButton.style.visibility = visibility
          jumpLabel.style.visibility = visibility

          if (world.client?.env === "dev") {
            posText.innerHTML = `<span style='color: #00ffff'>${position.data.x.toFixed(2)}</span><span style='color: #ffff00'> ${position.data.y.toFixed(2)}</span><span style='color: #ff33cc'> ${position.data.z.toFixed(2)}</span>`
            posText.style.visibility = "visible"
          } else {
            posText.style.visibility = "hidden"
          }
        }

        const state = world.game.state as DDEState
        const pcApplesEaten = state.applesEaten[world.client?.playerId() || ""] || 0

        if (pcApplesEaten !== currentApplesEaten) {
          currentApplesEaten = pcApplesEaten
          scoreText.innerHTML = `<span>apples: </span><span style='color: #ffc0cb'>${currentApplesEaten}</span>`
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
    // borderImage: "linear-gradient(to bottom, #ffffff, #cccccc) 1",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    color: "#ffffff",
    border: "2px solid #ffffff",
    borderRadius: "8px",
    lineHeight: "18px",
    visibility: props.visible === false ? "hidden" : "visible",
    transform: "translateX(-50%)"
  }
})
