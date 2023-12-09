import { Renderer, Entity } from "@piggo-legends/core";
import { Position, Renderable, TextBox, chatBuffer, chatHistory, chatIsOpen } from "@piggo-legends/contrib";
import { Container, HTMLText } from "pixi.js";

export const Chat = (renderer: Renderer): Entity => {

  const textBoxes = new Renderable({
    renderer,
    debuggable: false,
    container: new Container(),
    cameraPos: { x: -400, y: -100 },
    zIndex: 100,
  });

  const chatHistoryText = new TextBox({
    renderer,
    text: "hello",
    fontSize: 16,
    color: 0x55FFFF,
    dynamic: (t: HTMLText, r: TextBox) => {
      const lines = chatHistory.slice(-4);

      lines.forEach((line, i) => {
        if (line.startsWith("/")) lines[i] = `<span style=color:#00ff00>${line}</span>`;
      });
      t.text = lines.join("<br>");
      r.c.position.set(0, -1 * t.height + 15);
    }
  });

  const chatBufferText = new TextBox({
    renderer,
    text: "world",
    fontSize: 16,
    color: 0xFFFF33,
    cameraPos: { x: -50, y: -200 },
    dynamic: (t: HTMLText) => {
      chatIsOpen ? t.text = `${chatBuffer.join("")}|` : t.text = ""
    }
  });

  chatBufferText.c.position.set(0, 15);

  textBoxes.c.addChild(chatHistoryText.c);
  textBoxes.c.addChild(chatBufferText.c);

  return {
    id: "chat",
    components: {
      position: new Position({}),
      renderable: textBoxes
    }
  }
}
