import { Entity, Position, Renderable } from "@piggo-gg/core";
import { Container, Graphics, Text } from "pixi.js";

export const AbilityHUD = (): Entity => {

  const w = 50;

  const squareQ = new Graphics();
  const squareW = new Graphics();
  const squareE = new Graphics();
  const squareR = new Graphics();

  const abilityHud = Entity<Renderable | Position>({
    id: "abilityHud",
    components: {
      position: new Position({ x: 300, y: -100, screenFixed: true }),
      renderable: new Renderable({
        container: async (renderer) => {
          const canvasWidth = renderer.props.canvas.width;
          abilityHud.components.position.setPosition({ x: canvasWidth / 2, y: -100 })

          const c = new Container();

          // QWER squares
          squareQ.rect(-150, 0, w, w).fill({ color: 0x000000, alpha: 0.4 }).stroke({ width: 1, color: 0xffffff });
          squareW.rect(-75, 0, w, w).fill({ color: 0x000000, alpha: 0.4 }).stroke({ width: 1, color: 0xffffff });
          squareE.rect(0, 0, w, w).fill({ color: 0x000000, alpha: 0.4 }).stroke({ width: 1, color: 0xffffff });
          squareR.rect(75, 0, w, w).fill({ color: 0x000000, alpha: 0.4 }).stroke({ width: 1, color: 0xffffff });

          // QWER hotkeys text bottom-left of squares
          const keyQ = new Text({ text: "Q", style: { fill: 0xffffff, fontSize: 12 } });
          const keyW = new Text({ text: "W", style: { fill: 0xffffff, fontSize: 12 } });
          const keyE = new Text({ text: "E", style: { fill: 0xffffff, fontSize: 12 } });
          const keyR = new Text({ text: "R", style: { fill: 0xffffff, fontSize: 12 } });

          const graphicsQ = new Text({ resolution: 4, text: "wall", style: { fill: 0xffffff, fontSize: 18 } });
          graphicsQ.position.set(-141, 10);

          keyQ.position.set(-148, 35);
          keyW.position.set(-73, 35);
          keyE.position.set(2, 35);
          keyR.position.set(77, 35);

          c.addChild(squareQ);
          c.addChild(keyQ)
          c.addChild(graphicsQ);

          c.addChild(squareW);
          c.addChild(keyW);

          c.addChild(squareE);
          c.addChild(keyE);

          c.addChild(squareR);
          c.addChild(keyR);
          return c;
        },
        dynamic: (c, __, e, w) => {
          const playerEntity = w.clientPlayerId ? w.entities[w.clientPlayerId] : undefined;
          if (!playerEntity) return;

          const Q = w.entities[playerEntity.components.controlling?.data.entityId ?? -1]?.components.actions?.actionMap["Q"]
          if (!Q) return;

          if (!Q.cdLeft || !Q.cooldown) return;

          const qCooldownRatio =  Q.cdLeft / Q.cooldown;
          squareQ.tint = (255 << 16) + (255 << 8) + (1 - qCooldownRatio) * 255;
        },
        zIndex: 10
      })
    }
  });

  return abilityHud;
}
