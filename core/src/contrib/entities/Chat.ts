import { Entity } from "@piggo-legends/core";
import { Position, Renderable, TextBox, chatBuffer, chatHistory, chatIsOpen } from "@piggo-legends/core";
import { Text } from "pixi.js";

// TODO refactor
export const Chat = (): Entity => {

  const chatHistoryText = () => new TextBox({
    padding: 3,
    fontSize: 16,
    color: 0x55FFFF,
    dynamic: (t: Text, r: TextBox) => {
      // take last 4 lines
      let lines = chatHistory.slice(-4);

      // join with linebreak
      t.text = lines.join("\n");

      // offset from bottom
      r.c.position.set(0, -1 * t.height + 20);
    }
  });

  const chatBufferText = () => new TextBox({
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

  return {
    id: "chat",
    components: {
      position: new Position({ x: -400, y: -200, screenFixed: true }),
      renderable: new Renderable({
        zIndex: 4,
        children: async () => [chatHistoryText(), chatBufferText()]
      })
    }
  }
}
