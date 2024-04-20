import { Entity, Position, Renderable } from "@piggo-gg/core";
import { Container, Graphics, Text } from "pixi.js";

export const AbilityHUD = (): Entity => {

  const w = 50;

  const abilityHud = Entity<Renderable | Position>({
    id: "abilityHud",
    components: {
      position: new Position({ x: 300, y: -100, screenFixed: true }),
      renderable: new Renderable({
        container: async () => {
          const c = new Container();

          const square = new Graphics();
          square.rect(-150, 0, w, w).rect(-75, 0, w, w).rect(0, 0, w, w).rect(75, 0, w, w);
          square.fill({ color: 0x000000, alpha: 0.4 }).stroke({ width: 1, color: 0xffffff });

          // QWER hotkeys text bottom-left of squares
          const keyQ = new Text({ text: "Q", style: { fill: 0xffffff, fontSize: 12 } });
          keyQ.position.set(-148, 35);

          const keyW = new Text({ text: "W", style: { fill: 0xffffff, fontSize: 12 } });
          keyW.position.set(-73, 35);

          const keyE = new Text({ text: "E", style: { fill: 0xffffff, fontSize: 12 } });
          keyE.position.set(2, 35);

          const keyR = new Text({ text: "R", style: { fill: 0xffffff, fontSize: 12 } });
          keyR.position.set(77, 35);

          c.addChild(square);
          c.addChild(keyQ)
          c.addChild(keyW);
          c.addChild(keyE);
          c.addChild(keyR);
          return c;
        },
        dynamic: (_, __, e, w) => {
          const newWidth = w.renderer?.props.canvas.width;
          if (newWidth) e.components.position?.setPosition({ x: newWidth / 2, y: -100 })
        },
        zIndex: 10
      })
    }
  });

  return abilityHud;
}
