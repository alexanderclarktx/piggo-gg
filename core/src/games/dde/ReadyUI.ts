import { Entity, HtmlDiv, HtmlText, NPC, Position } from "@piggo-gg/core"


export const ReadyUI = (): Entity => {

  let init = false

  const container = HtmlDiv({
    top: "10px",
    right: "10px",
    // transform: "translate(-100%)",
    width: "200px",
    height: "100px",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: "10px",
    border: "2px solid #ffffff",
  })

  // const playerRow = HtmlDiv({

  // })

  const playerName = HtmlText({
    text: "noob: 🔴",
    style: {
      transform: "translate(-50%)",
      marginTop: "10px",
      position: "relative",
    }
  })

  container.append(playerName)

  const ui = Entity({
    id: "ReadyUI",
    components: {
      position: Position(),
      npc: NPC({
        behavior: (_, world) => {
          if (!init) {
            init = true

            console.log("ReadyUI init")

            world.three?.append(container)
          }
        }
      })
    }
  })

  return ui
}
