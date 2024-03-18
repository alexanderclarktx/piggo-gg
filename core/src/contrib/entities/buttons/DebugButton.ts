import { Entity, ValidAction, World } from "@piggo-gg/core";
import { Button, Clickable, Position } from "@piggo-gg/core";
import { Text } from "pixi.js";

export const DebugButton = (): Entity => {

  let pressed = false;

  const debugButton = Entity({
    id: "debugButton",
    components: {
      position: new Position({ x: 40, y: 5, screenFixed: true }),
      clickable: new Clickable({
        width: 32, height: 32, active: true,
        click: ValidAction((_, world: World) => {
          pressed = !pressed;
          if (pressed) {
            const r = debugButton.components.renderable as Button;
            r.shadow.tint = 0x00ffff;
            r.outline.tint = 0x00ffff;
            if (world.renderer) world.debug = true;
          } else {
            const r = debugButton.components.renderable as Button;
            r.shadow.tint = 0xffffff;
            r.outline.tint = 0xffFFFF;
            if (world.renderer) world.debug = false;
          }
        })
      }),
      renderable: new Button({
        dims: { w: 32, textX: 8, textY: 5 },
        zIndex: 4,
        text: new Text({ text: "🔍", style: { fill: "#FFFFFF", fontSize: 16 } }),
      })
    }
  });
  return debugButton;
}
