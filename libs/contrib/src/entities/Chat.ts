import { Entity } from "@piggo-legends/core";
import { Position, Renderable, TextBox, chatBuffer, chatHistory, chatIsOpen } from "@piggo-legends/contrib";
import { HTMLText } from "pixi.js";

export const Chat = (): Entity => {

  const chatHistoryText = () => new TextBox({
    text: "hello",
    fontSize: 16,
    color: 0x55FFFF,
    dynamic: (t: HTMLText, r: TextBox) => {
      // take last 4 lines
      const lines = chatHistory.slice(-4);

      // color green if command
      lines.forEach((line, i) => {
        if (line.startsWith("/")) lines[i] = `<span style=color:#00ff00>${line}</span>`;
      });

      // join with linebreak
      t.text = lines.join("<br>");

      // offset
      r.c.position.set(0, -1 * t.height + 15);
    }
  });

  const chatBufferText = () => new TextBox({
    text: "world",
    fontSize: 16,
    color: 0xFFFF33,
    dynamic: (t: HTMLText) => {
      chatIsOpen ? t.text = `${chatBuffer.join("")}|` : t.text = ""
    },
    position: { x: 0, y: 15 }
  });

  return {
    id: "chat",
    components: {
      position: new Position({ x: -400, y: -200, screenFixed: true }),
      renderable: new Renderable({
        debuggable: false,
        zIndex: 4,
        children: async () => [chatHistoryText(), chatBufferText()]
      })
    }
  }
}
