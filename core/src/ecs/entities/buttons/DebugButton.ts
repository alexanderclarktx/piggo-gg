import { Actions, Button, Clickable, Entity, Position, pixiText } from "@piggo-gg/core";
import { Graphics } from "pixi.js";

export const DebugButton = (): Entity => {

  let pressed = false;

  const outline = new Graphics();
  const shadow = new Graphics();

  const debugButton = Entity({
    id: "debugButton",
    components: {
      position: new Position({ x: 40, y: 5, screenFixed: true }),
      actions: new Actions({
        click: {
          invoke: ({ world }) => {
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
          }
        }
      }),
      clickable: new Clickable({ width: 32, height: 32, active: true }),
      renderable: Button({
        dims: { w: 32, textX: 8, textY: 5 },
        zIndex: 4,
        text: pixiText({ text: "🔍", style: { fill: 0xffffff, fontSize: 16 }}),
        outline, shadow
      })
    }
  });
  return debugButton;
}
