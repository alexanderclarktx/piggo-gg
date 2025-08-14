import { Entity, HtmlDiv, HtmlText, NPC, Position } from "@piggo-gg/core";

export const HtmlChat = (): Entity => {

  let init = false

  const wrapper = HtmlDiv({
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    width: "300px",
    height: "400px",
    right: "10px",
    bottom: "10px",
    transform: "translate(0%)",
    borderRadius: "8px"
  })

  const input = HtmlText({
    text: "",
    style: {
      position: "absolute",
      width: "280px",
      height: "30px",
      bottom: "10px",
      left: "10px",
      borderRadius: "8px",
      
      backgroundColor: "rgba(0, 0, 0, 0.5)"
    }
  })

  wrapper.appendChild(input)

  const chat = Entity({
    id: "html-chat",
    persists: true,
    components: {
      position: Position(),
      npc: NPC({
        behavior: (_, world) => {
          if (!world.client) return

          if (!init) {
            init = true
            world.three?.append(wrapper)
          }

          const { inputBuffer, isOpen } = world.client.chat
          if (isOpen) {
            wrapper.style.visibility = "visible"
            // wrapper.style.display = "block"
            // input.value = inputBuffer.join("\n")
          } else {
            wrapper.style.visibility = "hidden"
          }
        }
      })
    }
  })

  return chat
}
