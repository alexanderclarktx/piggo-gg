import { Entity, NPC, Position } from "@piggo-gg/core";

export const HtmlChat = (): Entity => {

  const chat = Entity({
    id: "html-chat",
    persists: true,
    components: {
      position: Position(),
      npc: NPC({
        behavior: (_, world) => {

        }
      })
    }
  })

  return chat
}
