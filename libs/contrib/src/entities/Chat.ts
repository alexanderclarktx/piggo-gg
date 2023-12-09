import { Renderer, Entity } from "@piggo-legends/core";
import { Position, Renderable, TextBox, chatBuffer, chatHistory, chatIsOpen } from "@piggo-legends/contrib";
import { Text, Container } from "pixi.js";

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
    dynamic: (t: Text, r: TextBox) => {
      t.text = chatHistory.slice(-4).join("\n");
      r.c.position.set(0, -1 * t.height + 15);
    }
  });

  const chatBufferText = new TextBox({
    renderer,
    text: "world",
    fontSize: 16,
    color: 0xFFFF33,
    cameraPos: { x: -50, y: -200 },
    dynamic: (t: Text, r: Renderable) => {
      chatIsOpen ? r.c.visible = true : r.c.visible = false;
      t.text = `${chatBuffer.join("")}|`;
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
