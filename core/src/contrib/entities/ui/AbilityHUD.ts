import { Entity, Position, Renderable, Renderer } from "@piggo-gg/core";
import { Graphics } from "pixi.js";

export const AbilityHUD = (): Entity => {

  const abilityHud = Entity<Renderable | Position>({
    id: "abilityHud",
    components: {
      position: new Position({ x: 300, y: -100, screenFixed: true }),
      renderable: new Renderable({
        container: async (r: Renderer) => {


          const square = new Graphics();
          square.rect(-150, 0, 50, 50).rect(-75, 0, 50, 50).rect(0, 0, 50, 50).rect(75, 0, 50, 50);
          square.stroke({width: 1}).fill({ color: 0x00FFFF, alpha: 0.5 });

          return square;
        },
        dynamic: (c: Graphics, r: Renderable, e, w) => {
          const newWidth = w.renderer?.props.canvas.width;
          if (newWidth) {
            e.components.position?.setPosition({ x: newWidth / 2, y: -100 })
            console.log(newWidth)
            // r.c.position.set(newWidth - 300, newHeight - 100)
          }
        },
        zIndex: 10
      })
    }
  });

  return abilityHud;
}
