import { Entity, Game } from "@piggo-legends/core";
import { Actions, Button, Clickable, Position } from "@piggo-legends/core";
import { Text } from "pixi.js";

export const DebugButton = (): Entity => {

  let pressed = false;

  const debugButton = {
    id: "debugButton",
    components: {
      position: new Position({ x: 5, y: 5, screenFixed: true }),
      clickable: new Clickable({
        onPress: "onPress",
        width: 32,
        height: 32,
        active: true
      }),
      actions: new Actions<"onPress">({
        onPress: (_, game: Game) => {
          pressed = !pressed;
          if (pressed) {
            const r = debugButton.components.renderable as Button;
            r.shadow.tint = 0xff0000;
            r.outline.tint = 0xff0000;
            if (game.renderer) game.debug = true;
          } else {
            const r = debugButton.components.renderable as Button;
            r.shadow.tint = 0x00FFFF;
            r.outline.tint = 0x00FFFF;
            if (game.renderer) game.debug = false;
          }
        }
      }),
      renderable: new Button({
        dims: { w: 32, textX: 8, textY: 5 },
        zIndex: 1,
        text: (new Text("🔍", { fill: "#FFFFFF", fontSize: 16 })),
      })
    }
  }
  return debugButton;
}
