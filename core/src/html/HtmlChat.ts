import { Entity, entries, HtmlDiv, HtmlText, NPC, Position } from "@piggo-gg/core";

export const HtmlChat = (): Entity => {

  let init = false
  // let hideTimer = 0
  let inputText = ""

  const fadeStack: number[] = []

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

          // if (hideTimer > 0) hideTimer -= 1
          // if (isOpen) hideTimer = 100

          border.style.visibility = isOpen ? "visible" : "hidden"
          input.style.visibility = isOpen ? "visible" : "hidden"

          const buffered = `${inputBuffer}│`
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
                      position: "relative",
                      color: from ? "#ffffff" : "#00eeff"
                    }
                  }))

                  fadeStack.push(world.tick + 160)
                }
              }
            }
          }

          fresh.clear()

          const len = fadeStack.length
          for (let i = 0; i < len; i++) {

            const diff = world.tick - fadeStack[i]

            const child = messages.children[len - 1 - i] as HtmlDiv

            if (diff >= 20) {
              child.style.visibility = "hidden"
              fadeStack.shift()
            } else {
              child.style.opacity = `${Math.max(0, 1 - diff / 20)}`
            }
          }
        }
      })
    }
  })

  return chat
}
