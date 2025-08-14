import { Entity, entries, HtmlDiv, HtmlText, NPC, Position } from "@piggo-gg/core";

export const HtmlChat = (): Entity => {

  let init = false
  let text = ""
  let hideTimer = 0

  const wrapper = HtmlDiv({
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    width: "300px",
    height: "400px",
    right: "10px",
    bottom: "10px",
    transform: "translate(0%)",
    borderRadius: "8px",
    border: "2px solid white",
    display: "flex",
    flexDirection: "column"
  })

  const messages = HtmlDiv({
    width: "280px",
    top: "10px",
    left: "10px",
    marginBottom: "30px",
    borderRadius: "8px",
    position: "relative",

    flex: 1,
    overflow: "scroll",
    backgroundColor: "rgba(0, 0, 255, 0.5)"
  })

  const input = HtmlText({
    text: "",
    style: {
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      border: "2px solid white",
      borderRadius: "8px",
      bottom: "10px",
      display: "flex",
      fontSize: "18px",
      left: "10px",
      minHeight: "30px",
      paddingLeft: "10px",
      paddingRight: "10px",
      position: "relative",
      width: "260px",
      wordBreak: "break-all"
    }
  })

  wrapper.appendChild(messages)
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
            // world.three?.append(messages)
          }

          const { inputBuffer, isOpen } = world.client.chat

          // if (isOpen) {
          //   hideTimer = 120
          // } else if (hideTimer > 0) {
          //   hideTimer--
          // }

          // if (hideTimer > 0 && hideTimer < 20) {
          //   wrapper.style.opacity = `${hideTimer / 20}`
          // } else if (hideTimer >= 20) {
          //   wrapper.style.opacity = "1"
          // }

          wrapper.style.visibility = isOpen ? "visible" : "hidden"

          if (inputBuffer.join("") !== text) {
            text = inputBuffer.join("")
            input.textContent = text
          }


          let lastMessages: string[] = []

          // get last 4 messages
          for (const tick of world.messages.keys().slice(-4)) {
            const messagesForEntity = world.messages.atTick(tick)
            if (messagesForEntity) {
              for (const [entityId, messages] of entries(messagesForEntity)) {
                const entity = world.entities[entityId]
                if (entity?.components.pc) {
                  const playerName = entity.components.pc.data.name ?? entityId
                  messages.forEach((message) => {
                    if (messages.length < 4) lastMessages.push(`${playerName}: ${message}`)
                  })
                }
              }
            }
          }

          if (lastMessages.length) {

          }
          // if (messagesForEntity) entries(messagesForEntity).forEach(([player, messages]) => {
          //   const playerName = world.entities[player]?.components.pc?.data.name ?? player
          //   messages.forEach((message) => {
          //     if (messages.length < 4) lastMessages.push(`${playerName}: ${message}`)
          //   })
          // })
          // })

          // t.text = lastMessages.reverse().join("\n")
        }
      })
    }
  })

  return chat
}
