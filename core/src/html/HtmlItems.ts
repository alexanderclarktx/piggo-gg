import { Client, HtmlDiv, RefreshableDiv } from "@piggo-gg/core"

export const HtmlItems = (client: Client): RefreshableDiv => {

  let lastSeenItems: string[] = []

  const div = HtmlDiv({
    width: "398px",
    height: "54px",
    bottom: "50px",
    left: "50%",
    transform: "translate(-50%)",
    visibility: "hidden",
    border: "3px solid white",
    outline: "2px solid black",
    display: "flex"
  })

  for (let i = 0; i < 7; i++) {
    div.appendChild(cell())
  }

  return {
    div,
    update: () => {
      const pc = client.playerCharacter()
      if (!pc || !pc.components.inventory) {
        lastSeenItems = []
        div.style.visibility = "hidden"
        return
      }
      div.style.visibility = "visible"

      const { items } = pc.components.inventory.data

      
    }
  }
}

const cell = () => HtmlDiv({
  width: "53px",
  height: "50px",
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  border: "2px solid white",
  position: "relative",
  borderRadius: "0px"
})
