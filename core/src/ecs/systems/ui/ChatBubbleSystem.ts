import { ClientSystemBuilder, Entity, Position, Renderable, TextBox } from "@piggo-gg/core"

// draws chat bubbles above characters
export const ChatBubbleSystem = ClientSystemBuilder({
  id: "ChatBubbleSystem",

  init: (world) => {

    const entityChatBubble: Record<string, [Renderable, number]> = {}

    return {
      id: "ChatBubbleSystem",
      query: ["position", "renderable"],
      priority: 5, // todo
      onTick: (entities: Entity<Position | Renderable>[]) => {

        // todo clean up old chat bubbles
  
        entities.forEach((entity) => {
  
          const { renderable } = entity.components
  
          // const textForEntity = world.messages.at(world.tick - 1, controlled.data.entityId)
          // if (textForEntity?.length) {
  
          //   const textBox = TextBox({
          //     text: textForEntity[0],
          //     fontSize: 12,
          //     color: 0xffffff,
          //     padding: 5,
          //     boxOutline: true
          //   })
  
          //   entityChatBubble[entity.id] = [textBox, world.tick - 1]
  
          //   world.addEntity(Entity({
          //     id: "chatBubble",
          //     components: {
          //       position: Position({ x: 200, y: 200, screenFixed: true }),
          //       renderable: Renderable({
          //         zIndex: 4,
          //         scale: 1,
          //         setChildren: async () => [textBox]
          //       })
          //     }
          //   }))
  
            // todo attach chat bubble to character
          // }
        })
      }
    }
  }
})
