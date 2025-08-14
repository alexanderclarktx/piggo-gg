import { Entity, entries, HtmlDiv, HtmlText, NPC, Position } from "@piggo-gg/core";

export const HtmlChat = (): Entity => {

  let init = false
  let hideTimer = 0
  let inputText = ""
  let messagesText = ""

  const wrapper = HtmlDiv({
    width: "300px",
    height: "300px",
    right: "10px",
    bottom: "10px",
    transform: "translate(0%)",
    display: "flex",
    flexDirection: "column"
  })

  const border = HtmlDiv({
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: "8px",
    border: "2px solid white",
  })

  const messages = HtmlText({
    text: "",
    style: {
      backgroundColor: "rgba(0, 0, 255, 0.5)",
      borderRadius: "8px",
      flex: 1,
      left: "10px",
      marginBottom: "30px",
      overflow: "scroll",
      position: "relative",
      top: "10px",
      whiteSpace: "pre-line",
      width: "280px",
      wordBreak: "break-all",

      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-end",
      alignItems: "flex-start",
    }
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

  wrapper.appendChild(border)
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

          border.style.visibility = isOpen ? "visible" : "hidden"

          const buffered = `${inputBuffer.join("")}│`
          if (buffered !== inputText) {
            inputText = buffered
            input.textContent = inputText
          }

          let lastMessages: string[] = []

          // get last 4 messages
          for (const tick of world.messages.keys().slice(0, 10)) {
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

          const joined = lastMessages.reverse().join("\n")
          if (joined !== messagesText) {
            messagesText = joined
            messages.textContent = messagesText
          }
        }
      })
    }
  })

  return chat
}
