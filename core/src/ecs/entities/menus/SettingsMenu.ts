import {
  DDESettings, HtmlButton, HtmlDiv, HtmlInput, HtmlText,
  max, min, RefreshableDiv, round, styleSwitch, World
} from "@piggo-gg/core"

export const SettingsMenu = (world: World): RefreshableDiv => {
  const div = HtmlDiv({
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    display: "flex",
    flex: "1 1 auto",
    flexDirection: "column",
    left: "50%",
    overflowY: "scroll",
    pointerEvents: "auto",
    position: "relative",
    top: "-3px",
    touchAction: "pan-y",
    transform: "translate(-50%)",
    width: "100%"
  })

  const ambientSound = boolRow(world, "Ambient Sound", "ambientSound")
  const showCrosshair = boolRow(world, "Show Crosshair", "showCrosshair")
  const showControls = boolRow(world, "Show Controls", "showControls")
  const sensitivity = numRow(world, "Mouse Sensitivity", "mouseSensitivity")

  div.appendChild(ambientSound.div)
  div.appendChild(showCrosshair.div)
  div.appendChild(showControls.div)
  div.appendChild(sensitivity.div)

  return {
    div,
    update: () => {
      const settings = world.settings<DDESettings>()
      styleSwitch(ambientSound.button, settings.ambientSound, ambientSound.button.matches(":hover"))
      styleSwitch(showControls.button, settings.showControls, showControls.button.matches(":hover"))
      styleSwitch(showCrosshair.button, settings.showCrosshair, showCrosshair.button.matches(":hover"))
    }
  }
}

const numRow = (world: World, text: string, key: "mouseSensitivity"): { div: HtmlDiv, input: HtmlDiv } => {
  const label = HtmlText({
    text,
    style: {
      width: "80%",
      height: "40px",
      position: "relative",
      left: "10px",
      fontSize: "18px",
      lineHeight: "40px",
      textAlign: "center",
      touchAction: "pan-y"
    }
  })

  const input = HtmlInput({
    text: "1.00",
    style: { width: "60px" },
    handler: (value) => {
      const num = parseFloat(value)

      if (isNaN(num)) return "1.00"

      const final = min(5, max(round(num, 2), 0.01))

      world.settings<DDESettings>().mouseSensitivity = final
      return final.toFixed(2)
    }
  })

  const div = HtmlDiv({
    position: "relative",
    marginTop: "15px",
    display: "flex",
    border: "",
    touchAction: "pan-y"
  })

  div.appendChild(label)
  div.appendChild(input)

  return { div, input }
}

const boolRow = (world: World, text: string, key: "ambientSound" | "showControls" | "showCrosshair"): { div: HtmlDiv, button: HtmlButton } => {
  const label = HtmlText({
    text,
    style: {
      width: "80%",
      height: "40px",
      position: "relative",
      left: "10px",
      fontSize: "18px",
      lineHeight: "40px",
      textAlign: "center",
      touchAction: "pan-y"
    }
  })

  const button = HtmlButton({
    style: {
      width: "60px",
      height: "40px",
      position: "relative",
      fontSize: "18px",
      pointerEvents: "auto"
    },
    onClick: () => {
      const settings = world.settings<DDESettings>()
      settings[key] = !settings[key]
    }
  })

  const div = HtmlDiv({
    position: "relative",
    marginTop: "15px",
    display: "flex",
    border: "",
    touchAction: "pan-y"
  })

  div.appendChild(label)
  div.appendChild(button)

  return { div, button }
}
