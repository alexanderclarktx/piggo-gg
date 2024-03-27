import { Action, Entity, World } from "@piggo-gg/core";
import { Button, Clickable, Position } from "@piggo-gg/core";
import { Graphics, Text } from "pixi.js";

export const DebugButton = (): Entity => {

  let pressed = false;

  const outline = new Graphics();
  const shadow = new Graphics();

  const debugButton = Entity({
    id: "debugButton",
    persists: true,
    components: {
      position: new Position({ x: 40, y: 5, screenFixed: true }),
      clickable: new Clickable({
        width: 32, height: 32, active: true,
        click: Action((_, __, world: World) => {
          pressed = !pressed;
          if (pressed) {
            shadow.tint = 0x00ffff;
            outline.tint = 0x00ffff;
            if (world.renderer) world.debug = true;
          } else {
            shadow.tint = 0xffffff;
            outline.tint = 0xffFFFF;
            if (world.renderer) world.debug = false;
          }
        })
      }),
      renderable: Button({
        dims: { w: 32, textX: 8, textY: 5 },
        zIndex: 4,
        text: new Text({ text: "🔍", style: { fill: "#FFFFFF", fontSize: 16 } }),
        outline, shadow
      })
    }
  });
  return debugButton;
}
