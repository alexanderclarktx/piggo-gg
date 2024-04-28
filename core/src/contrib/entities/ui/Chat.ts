import { Entity, Position, Renderable, TextBox, World, chatBuffer, chatIsOpen } from "@piggo-gg/core";
import { Text } from "pixi.js";

export const Chat = (): Entity => {

  const chatHistoryText = () => TextBox({
    padding: 3,
    fontSize: 16,
    color: 0x55FFFF,
    dynamic: (t: Text, r: Renderable, _, w: World) => {

      // hide chat if no recent messages
      if ((w.tick - w.chatHistory.keys()[0]) > 125) {
        t.text = "";
      } else {
        let lastMessages: string[] = [];

        // get last 4 messages
        w.chatHistory.keys().slice(0, 4).forEach((tick) => {
          const messagesForEntity = w.chatHistory.atTick(tick);
          if (messagesForEntity) Object.entries(messagesForEntity).forEach(([player, messages]) => {
            messages.forEach((message) => {
              if (messages.length < 4) lastMessages.push(`${player}: ${message}`);
            });
          });
        });

        t.text = lastMessages.reverse().join("\n");
      }

      // offset from bottom
      r.c.position.set(0, -1 * t.height + 20);
    }
  });

  const chatBufferText = () => TextBox({
    position: { x: 0, y: 25 },
    fontSize: 16,
    color: 0xFFFF33,
    // boxOutline: true,
    // visible: false,
    dynamic: (t: Text) => {
      const textToRender = chatBuffer.join("");
      chatIsOpen ? t.text = `${textToRender}|` : t.text = "";
    }
  });

  return Entity({
    id: "chat",
    persists: true,
    components: {
      position: new Position({ x: -400, y: -200, screenFixed: true }),
      renderable: new Renderable({
        zIndex: 4,
        setChildren: async () => [chatHistoryText(), chatBufferText()]
      })
    }
  });
}
