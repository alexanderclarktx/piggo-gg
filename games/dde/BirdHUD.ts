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

    // const width = world.three?.canvas.clientWidth || 800
    const height = world.three?.canvas.clientHeight || 600

    const top = height / 5 * 4
    const left = 100

    const aButton = HtmlButton({
      text: "A",
      style: { top: `${top}px`, left: `${left - 50}px`, ...HUDStyle }
    })

    world.three?.canvas.parentElement?.appendChild(aButton)

    world.three?.canvas.parentElement?.appendChild(HtmlButton({
      text: "W",
      style: { top: `${top - 50}px`, left: `${left}px`, ...HUDStyle }
    }))

    world.three?.canvas.parentElement?.appendChild(HtmlButton({
      text: "D",
      style: { top: `${top}px`, left: `${left + 50}px`, ...HUDStyle }
    }))

    world.three?.canvas.parentElement?.appendChild(HtmlButton({
      text: "S",
      style: { top: `${top}px`, left: `${left}px`, ...HUDStyle }
    }))

    world.three?.canvas.parentElement?.appendChild(HtmlButton({
      text: "E",
      style: { top: `${top - 150}px`, left: `${left}px`, ...HUDStyle }
    }))

    return {
      id: "BirdHUD",
      query: [],
      priority: 10,
      onTick: () => {

      }
    }
  }
})
