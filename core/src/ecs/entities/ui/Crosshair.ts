import { Entity, HtmlDiv, NPC, Position } from "@piggo-gg/core"

export const Crosshair = () => {

  let init = false

  const crosshair = Entity({
    id: "crosshair",
    components: {
      position: Position(),
      npc: NPC({
        behavior: (_, world) => {
          if (!init) {
            init = true

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

            world.three?.append(div)
          }
        }
      })
    }
  })

  return crosshair
}
