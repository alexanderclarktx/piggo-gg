import { Entity, HtmlDiv, HtmlText, NPC, Position } from "@piggo-gg/core"

export const Profile = (): Entity => {
  const div = HtmlDiv({
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    width: "165px",
    height: "80px",
    left: "10px",
    top: "10px",
    border: "2px solid #ffffff",
    borderRadius: "10px",
  })

  const name = HtmlText({
    text: "noob",
    style: {
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%)",
      fontSize: "36px"
    }
  })

  div.appendChild(name)

  const profile = Entity({
    id: "HtmlProfile",
    components: {
      position: Position(),
      npc: NPC({
        behavior: (_, world) => {
          if (!world.three?.canvas.parentElement?.contains(div)) {
            world.three?.canvas.parentElement?.appendChild(div)
            console.log("Profile UI added")
          }

          const playerName = world.client?.playerName()
          if (playerName && playerName !== name.textContent) {
            name.textContent = playerName
          }
        }
      })

    }
  })

  return profile
}
