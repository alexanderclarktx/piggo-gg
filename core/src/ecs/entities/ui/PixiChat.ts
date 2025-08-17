import { Entity, Position, Renderable, TextBox, entries } from "@piggo-gg/core"
import { Text } from "pixi.js"

export const PixiChat = (): Entity => {

  const messagesText = () => TextBox({
    padding: 3,
    fontSize: 16,
    color: 0x55FFFF,
    onTick: ({ container, renderable, world }) => {
      const t = container as Text

      // hide chat if no recent messages
      if ((world.tick - world.messages.keys()[0]) > 125) {
        t.text = ""
      } else {
        let lastMessages: string[] = []

        // get last 4 messages
        world.messages.keys().slice(0, 4).forEach((tick) => {
          const messagesForEntity = world.messages.atTick(tick)
          if (messagesForEntity) entries(messagesForEntity).forEach(([player, messages]) => {
            const playerName = world.entities[player]?.components.pc?.data.name ?? player
            messages.forEach((message) => {
              if (messages.length < 4) lastMessages.push(`${playerName}: ${message}`)
            })
          })
        })

        t.text = lastMessages.reverse().join("\n")
      }

      // offset from bottom
      renderable.c.position.set(0, -1 * t.height + 20)
    }
  })

  const chatBufferText = () => TextBox({
    position: { x: 0, y: 25 },
    fontSize: 16,
    color: 0xFFFF33,
    // boxOutline: true,
    // visible: false,
    onTick: ({ container, world }) => {
      const t = container as Text
      const textToRender = world.client!.chat.inputBuffer
      world.client?.chat.isOpen ? t.text = `${textToRender}|` : t.text = ""
    }
  })

  return Entity({
    id: "chat",
    persists: true,
    components: {
      position: Position({ x: -400, y: -200, screenFixed: true }),
      renderable: Renderable({
        zIndex: 10,
        setChildren: async () => [messagesText(), chatBufferText()]
      })
    }
  })
}
