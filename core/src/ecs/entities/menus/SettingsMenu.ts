import { DDESettings, HtmlButton, HtmlDiv, HtmlText, RefreshableDiv, styleSwitch, World } from "@piggo-gg/core"

export const SettingsMenu = (world: World): RefreshableDiv => {
  const settings = HtmlDiv({
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

  const settingsRow = (text: string, key: keyof DDESettings): { div: HtmlDiv, button: HtmlButton } => {
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

  const ambientSound = settingsRow("Ambient Sound", "ambientSound")
  const showControls = settingsRow("Show Controls", "showControls")
  const showCrosshair = settingsRow("Show Crosshair", "showCrosshair")

  settings.appendChild(ambientSound.div)
  settings.appendChild(showControls.div)
  settings.appendChild(showCrosshair.div)

  return {
    div: settings,
    update: () => {
      const settings = world.settings<DDESettings>()
      styleSwitch(ambientSound.button, settings.ambientSound, ambientSound.button.matches(":hover"))
      styleSwitch(showControls.button, settings.showControls, showControls.button.matches(":hover"))
      styleSwitch(showCrosshair.button, settings.showCrosshair, showCrosshair.button.matches(":hover"))
    }
  }
}
