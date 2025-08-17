import { DDESettings, Entity, HtmlDiv, NPC, Position } from "@piggo-gg/core"

export const Crosshair = () => {

  let init = false

  const div = HtmlDiv({
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    width: "6px",
    height: "6px",
    backgroundColor: "#00ffff",
    border: "0px",
    borderRadius: "50%",
    pointerEvents: "none"
  })

  const crosshair = Entity({
    id: "crosshair",
    components: {
      position: Position(),
      npc: NPC({
        behavior: (_, world) => {
          const settings = world.settings<DDESettings>()
          const pc = world.client?.playerCharacter()

          if (!settings.showCrosshair || !pc?.components.position.data.flying) {
            div.style.visibility = "hidden"
          } else {
            div.style.visibility = "visible"
          }

          if (!init) {
            init = true

            world.three?.append(div)
          }
        }
      })
    }
  })

  return crosshair
}
