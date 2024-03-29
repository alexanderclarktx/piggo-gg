import { ClientSystemBuilder, Controlled, Entity, Position, Renderable, TextBox } from "@piggo-gg/core";

// draws chat bubbles above characters
export const ChatBubbleSystem = ClientSystemBuilder({
  id: "ChatBubbleSystem",

  init: ({ world }) => {

    const entityChatBubble: Record<string, [Renderable, number]> = {};

    const onTick = (entities: Entity<Position | Controlled | Renderable>[]) => {

      // todo clean up old chat bubbles

      entities.forEach((entity) => {

        const { controlled, renderable } = entity.components;

        const textForEntity = world.chatHistory.at(world.tick - 1, controlled.data.entityId);
        if (textForEntity?.length) {

          const textBox = TextBox({
            text: textForEntity[0],
            fontSize: 12,
            color: 0xffffff,
            padding: 5,
            boxOutline: true
          });

          entityChatBubble[entity.id] = [textBox, world.tick - 1];

          world.addEntity(Entity({
            id: "chatBubble",
            components: {
              position: new Position({ x: 200, y: 200, screenFixed: true }),
              renderable: new Renderable({
                zIndex: 4,
                scale: 1,
                children: async () => [textBox]
              })
            }
          }));

          // TODO attach chat bubble to character
        }
      });
    }

    return {
      id: "ChatBubbleSystem",
      query: ["position", "controlled", "renderable"],
      onTick
    }
  }
});
