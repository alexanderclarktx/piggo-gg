import { Entity, HtmlDiv, HtmlText, NPC, Position } from "@piggo-gg/core"

export const Profile = (): Entity => {

  let init = false

  const div = HtmlDiv({
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    width: "165px",
    height: "50px",
    left: "10px",
    top: "10px",
    border: "2px solid #ffffff",
    borderRadius: "10px",
  })

  const name = HtmlText({
    text: "",
    style: {
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%)",
      fontSize: "22px"
    }
  })

  div.appendChild(name)

  const profile = Entity({
    id: "HtmlProfile",
    components: {
      position: Position(),
      npc: NPC({
        behavior: (_, world) => {
          if (!init) {
            world.three?.canvas.parentElement?.appendChild(div)
            init = true
          }

          const playerName = world.client?.playerName()
          if (playerName && playerName !== name.textContent) {
            if (world.tick < 20) return
            name.textContent = playerName
          }
        }
      })
    }
  })
  return profile
}
