import { Entity, World } from "@piggo-legends/core";
import { Position, Renderable, TextBox, chatBuffer, chatIsOpen } from "@piggo-legends/core";
import { Text } from "pixi.js";

export const Chat = (): Entity => {

  const chatHistoryText = () => new TextBox({
    padding: 3,
    fontSize: 16,
    color: 0x55FFFF,
    dynamic: (t: Text, r: TextBox, _, w: World) => {
      const lastLines = w.chatHistory.keys().slice(0, 4)

      let lastMessages: string[] = [];
      lastLines.forEach((tick) => {
        const messagesForEntity = w.chatHistory.atTick(tick);
        if (messagesForEntity) Object.values(messagesForEntity).forEach((messages) => {
          messages.forEach((message) => {
            if (messages.length < 4) lastMessages.push(message)
          });
        });
      });

      let lines = lastMessages.reverse();

      // let lines = w.chatHistory.keys().slice(-4).map((k) => w.chatHistory.atTick(k));
      // console.log(JSON.stringify(lines));

      // make command lines green
      // lines.forEach((line, i) => {
      //   if (line.startsWith("/")) lines[i] = `<span style=color:#00ff00>${line}</span>`;
      // });

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
