import { Entity, Position, Renderable, pixiStyle, pixiText } from "@piggo-gg/core";
import { Container, Graphics } from "pixi.js";

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
          pixiStyle(squareQ.rect(-150, 0, w, w));
          pixiStyle(squareW.rect(-75, 0, w, w));
          pixiStyle(squareE.rect(0, 0, w, w));
          pixiStyle(squareR.rect(75, 0, w, w));

          // QWER hotkeys text bottom-left of squares
          const keyQ = pixiText({ text: "Q", pos: { x: -148, y: 35 } });
          const keyW = pixiText({ text: "W", pos: { x: -73, y: 35 } });
          const keyE = pixiText({ text: "E", pos: { x: 2, y: 35 } });
          const keyR = pixiText({ text: "R", pos: { x: 77, y: 35 } });

          const graphicsQ = pixiText({ text: "wall", fontSize: 18, pos: { x: -141, y: 10 } });

          c.addChild(squareQ, keyQ, squareW, keyW, squareE, keyE, squareR, keyR, graphicsQ);
          return c;
        },
        dynamic: (c, __, e, w) => {
          const playerEntity = w.clientPlayerId ? w.entities[w.clientPlayerId] : undefined;
          if (!playerEntity) return;

          const Q = w.entities[playerEntity.components.controlling?.data.entityId ?? -1]?.components.actions?.actionMap["Q"]
          if (!Q || !Q.cdLeft || !Q.cooldown) return;

          const qCooldownRatio = Q.cdLeft / Q.cooldown;
          squareQ.tint = (255 << 16) + (255 << 8) + (1 - qCooldownRatio) * 255;
        },
        zIndex: 10
      })
    }
  });

  return abilityHud;
}
