import { Entity, entries, HtmlDiv, HtmlText, NPC, Position } from "@piggo-gg/core";

export const HtmlChat = (): Entity => {

  let init = false
  let hideTimer = 0
  let inputText = ""

  const wrapper = HtmlDiv({
    width: "300px",
    height: "250px",
    right: "12px",
    bottom: "12px",
    transform: "translate(0%)",
    display: "flex",
    flexDirection: "column",
    border: ""
  })

  const border = HtmlDiv({
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: "8px"
  })

  const messages = HtmlText({
    style: {
      flex: 1,
      left: "10px",
      marginBottom: "30px",
      position: "relative",
      top: "10px",
      whiteSpace: "pre-line",
      width: "280px",
      wordBreak: "break-all",
      overflowY: "scroll",
      display: "flex",
      flexDirection: "column-reverse",
      alignItems: "flex-start",
      pointerEvents: "auto"
    }
  })

  const input = HtmlText({
    style: {
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
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
    components: {
      position: Position(),
      npc: NPC({
        behavior: (_, world) => {
          if (!world.client || world.client.mobile) return

          if (!init) {
            init = true
            world.three?.append(wrapper)
          }

          const { inputBuffer, isOpen } = world.client.chat

          if (hideTimer > 0) hideTimer -= 1
          if (isOpen) hideTimer = 100

          border.style.visibility = isOpen ? "visible" : "hidden"
          input.style.visibility = isOpen ? "visible" : "hidden"

          const buffered = `${inputBuffer.join("")}│`
          if (buffered !== inputText) {
            inputText = buffered
            input.textContent = inputText
          }

          // get messages from this tick
          const { fresh } = world.messages
          for (const freshTick of fresh) {
            const messagesThisTick = world.messages.atTick(freshTick)
            if (messagesThisTick) {
              for (const [id, msgs] of entries(messagesThisTick)) {
                for (const msg of msgs) {
                  const entity = world.entity(id)

                  const from = entity ? entity.components.pc?.data.name || "noob" : null
                  const text = from ? `${from}: ${msg}` : msg

                  messages.prepend(HtmlText({
                    text,
                    style: {
                      position: "relative"
                    }
                  }))
                }
              }
            }
          }

          fresh.clear()

          // let lastMessages: string[] = []

          // get recent messages
          // for (const tick of world.messages.keys().slice(0, 6)) {
          //   const messagesForEntity = world.messages.atTick(tick)
          //   if (messagesForEntity) {
          //     for (const [entityId, messages] of entries(messagesForEntity)) {
          //       const from = world.entity(entityId)?.components.pc?.data.name
          //       messages.forEach((message) => {
          //         const string = from ? `${from}: ${message}` : message
          //         if (messages.length < 4) lastMessages.push(string)
          //       })
          //     }
          //   }
          // }

          // TODO append child element per message instead
          // const joined = lastMessages.reverse().join("\n")
          // if (joined !== messagesText) {
          //   messagesText = joined
          //   messages.textContent = messagesText
          //   hideTimer = 100
          // }

          // if (hideTimer > 0 && hideTimer < 20) {
          //   messages.style.opacity = (hideTimer / 20).toString()
          // } else if (hideTimer === 0) {
          //   messages.style.visibility = "hidden"
          // } else {
          //   messages.style.visibility = "visible"
          //   messages.style.opacity = "1"
          // }
        }
      })
    }
  })

  return chat
}
