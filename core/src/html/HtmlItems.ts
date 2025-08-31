import { Client, entries, HtmlDiv, HtmlImg, RefreshableDiv } from "@piggo-gg/core"

export const HtmlItems = (client: Client): RefreshableDiv => {

  let lastSeenItems: (string | undefined)[] = []

  const cells: HTMLDivElement[] = []
  
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
    const cellDiv = cell()
    cells.push(cellDiv)
    div.appendChild(cellDiv)
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

      console.log(items)

      let updated = false

      // for (const [index, item] of entries(items)) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i]?.[0]
        if (!lastSeenItems[i] && lastSeenItems[i] !== item) {
          lastSeenItems[i] = item
          updated = true
        }
      }

      if (!updated) return

      for (let i = 0; i < items.length; i++) {
        const item = items[i]?.[0]
        if (!item) continue

        const img = HtmlImg("pickaxe.png", {
          width: "46px",
          height: "46px",
          position: "relative",
          imageRendering: "pixelated",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)"
        })
        cells[i].appendChild(img)
      }
    }
  }
}

const cell = () => HtmlDiv({
  width: "53px",
  height: "50px",
  backgroundColor: "rgba(0, 0, 0, 0.3)",
  border: "2px solid white",
  position: "relative",
  borderRadius: "0px"
})
