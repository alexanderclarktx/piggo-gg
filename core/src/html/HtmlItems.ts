import { Client, HtmlDiv, RefreshableDiv } from "@piggo-gg/core"

export const HtmlItems = (client: Client): RefreshableDiv => {

  let lastSeenItems: string[] = []

  const div = HtmlDiv({
    width: "400px",
    height: "50px",
    bottom: "50px",
    left: "50%",
    transform: "translate(-50%)",
    visibility: "hidden"
  })

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
