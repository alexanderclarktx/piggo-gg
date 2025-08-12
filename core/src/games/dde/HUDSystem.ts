import {
  HtmlButton, HtmlLabel, HtmlText, ClientSystemBuilder, HtmlDiv
} from "@piggo-gg/core"
import { DDESettings, DDEState } from "./DDE"

export const HUDSystem = ClientSystemBuilder({
  id: "HUDSystem",
  init: (world) => {

    if (world.client?.mobile === true) return

    const height = world.three?.canvas.clientHeight || 600

    const top = height / 5 * 3
    const left = 120

    const aButton = KeyButton({ text: "A", left: left - 50, top })
    const dButton = KeyButton({ text: "D", left: left + 50, top })
    const sButton = KeyButton({ text: "S", left, top })
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
        transform: "translate(-50%)",
      }
    })

    const posText = HtmlText({
      text: "0|0|0",
      style: {
        left: `50%`,
        top: `${height - 100}px`,
        fontSize: "24px",
        color: "#00ffff",
        transform: "translate(-50%)"
      }
    })

    const controls = HtmlDiv({
      position: "absolute",
      top: "0px",
      left: "0px",
      width: "100%",
      height: "100%",
      pointerEvents: "none"
    })

    controls.appendChild(aButton)
    controls.appendChild(dButton)
    controls.appendChild(sButton)
    controls.appendChild(wButton)
    controls.appendChild(eButton)
    controls.appendChild(boostButton)
    controls.appendChild(jumpButton)
    controls.appendChild(transformLabel)
    controls.appendChild(moveLabel)
    controls.appendChild(boostLabel)
    controls.appendChild(jumpLabel)

    world.three?.append(controls)
    world.three?.append(scoreText)
    world.three?.append(posText)

    const active = "rgba(0, 255, 255, 0.6)"
    const inactive = "rgba(0, 0, 0, 0.3)"

    let currentApplesEaten = -1

    return {
      id: "HUDSystem",
      query: [],
      priority: 10,
      onTick: () => {
        const settings = world.settings<DDESettings>()
        controls.style.display = settings.showControls ? "block" : "none"

        const down = world.client?.bufferDown.all()?.map(key => key.key)
        if (down) {
          aButton.style.backgroundColor = down.includes("a") ? active : inactive
          dButton.style.backgroundColor = down.includes("d") ? active : inactive
          sButton.style.backgroundColor = down.includes("s") ? active : inactive
          wButton.style.backgroundColor = down.includes("w") ? active : inactive
          eButton.style.backgroundColor = down.includes("e") ? active : inactive
          boostButton.style.backgroundColor = down.includes("shift") ? active : inactive
          jumpButton.style.backgroundColor = down.includes(" ") ? active : inactive
        }

        const pc = world.client?.playerCharacter()
        if (pc) {
          const { flying, x, y, z } = pc.components.position.data

          const visibility = flying ? "hidden" : "visible"

          jumpButton.style.visibility = visibility
          jumpLabel.style.visibility = visibility

          if (world.client?.env === "dev") {
            posText.innerHTML = `<span style='color: #00ffff'>${x.toFixed(2)}</span><span style='color: #ffff00'> ${y.toFixed(2)}</span><span style='color: #ff33cc'> ${z.toFixed(2)}</span>`
            posText.style.visibility = "visible"
          } else {
            posText.style.visibility = "hidden"
          }
        }

        const state = world.game.state as DDEState
        const pcApplesEaten = state.applesEaten[world.client?.playerId() || ""] || 0

        const isWarmup = state.phase === "warmup"
        eButton.style.visibility = isWarmup ? "visible" : "hidden"
        transformLabel.style.visibility = isWarmup ? "visible" : "hidden"

        if (pcApplesEaten !== currentApplesEaten) {
          currentApplesEaten = pcApplesEaten
          scoreText.innerHTML = `<span>apples: </span><span style='color: #ffc0cb'>${currentApplesEaten}/10</span>`
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
    visibility: props.visible === false ? "hidden" : "visible",
    transform: "translate(-50%)"
  }
})
