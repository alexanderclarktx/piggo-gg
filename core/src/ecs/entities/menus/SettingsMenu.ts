import { DDESettings, HtmlButton, HtmlDiv, HtmlInput, HtmlText, max, min, RefreshableDiv, round, styleSwitch, World } from "@piggo-gg/core"

export const SettingsMenu = (world: World): RefreshableDiv => {
  const div = HtmlDiv({
    top: "5px",
    left: "50%",
    width: "400px",
    height: "300px",
    transform: "translate(-50%)",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    pointerEvents: "auto",
    borderRadius: "10px",
    position: "relative"
  })

  const ambientSound = boolRow(world, "Ambient Sound", "ambientSound")
  const showControls = boolRow(world, "Show Controls", "showControls")
  const showCrosshair = boolRow(world, "Show Crosshair", "showCrosshair")
  const sensitivity = numRow(world, "Mouse Sensitivity", "mouseSensitivity")

  div.appendChild(ambientSound.div)
  div.appendChild(showControls.div)
  div.appendChild(showCrosshair.div)
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
      width: "320px",
      height: "40px",
      position: "relative",
      left: "10px",
      fontSize: "18px",
      lineHeight: "40px",
      textAlign: "center"
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
    border: ""
  })

  div.appendChild(label)
  div.appendChild(input)

  return { div, input }
}

const boolRow = (world: World, text: string, key: "ambientSound" | "showControls" | "showCrosshair"): { div: HtmlDiv, button: HtmlButton } => {
  const label = HtmlText({
    text,
    style: {
      width: "320px",
      height: "40px",
      position: "relative",
      left: "10px",
      fontSize: "18px",
      lineHeight: "40px",
      textAlign: "center"
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
    border: ""
  })

  div.appendChild(label)
  div.appendChild(button)

  return { div, button }
}
