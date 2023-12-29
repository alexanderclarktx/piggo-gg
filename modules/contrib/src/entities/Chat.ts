import { Entity } from "@piggo-legends/core";
import { Position, Renderable, TextBox, chatBuffer, chatHistory, chatIsOpen } from "@piggo-legends/contrib";
import { HTMLText } from "pixi.js";

export const Chat = (): Entity => {

  const chatHistoryText = () => new TextBox({
    padding: 3,
    text: "hello",
    fontSize: 16,
    color: 0x55FFFF,
    dynamic: (t: HTMLText, r: TextBox) => {
      // take last 2 lines
      let lines = chatHistory.slice(-4);

      // make commands green
      lines = lines.map((line) => (line.startsWith("/")) ? `<span style=color:#00ff00>${line}</span>` : line);

      // join with linebreak
      t.text = lines.join("<br>");

      // offset from bottom
      r.c.position.set(0, -1 * t.height + 20);
    }
  });

  const chatBufferText = () => new TextBox({
    text: "world",
    fontSize: 16,
    color: 0xFFFF33,
    dynamic: (t: HTMLText) => {
      const textToRender = chatBuffer.map((char) => (char === " ") ? "&nbsp;" : char).join("");
      chatIsOpen ? t.text = `${textToRender}|` : t.text = ""
    },
    position: { x: 0, y: 25 }
  });

  return {
    id: "chat",
    components: {
      position: new Position({ x: -400, y: -200, screenFixed: true }),
      renderable: new Renderable({
        debuggable: true,
        zIndex: 4,
        children: async () => [chatHistoryText(), chatBufferText()]
      })
    }
  }

}
