import { Entity, HDiv, NPC } from "@piggo-gg/core"

export const HtmlFeed = (): Entity => {
  let init = false

  const wrapper = HDiv({
    style: {
      width: "300px",
      height: "150px",
      right: "15px",
      top: "15px",
      backgroundImage: "",
      border: "2px solid white",
    }
  })

  return Entity({
    id: "htmlFeed",
    components: {
      npc: NPC({
        behavior: () => {
          if (!init) {
            document.body.appendChild(wrapper)
            console.log("HtmlFeed mounted")
            init = true
          }
        }
      })
    }
  })
}
