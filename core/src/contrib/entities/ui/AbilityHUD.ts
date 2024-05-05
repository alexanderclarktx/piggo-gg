import { Entity, Position, Renderable, pixiRect, pixiText } from "@piggo-gg/core";
import { Container } from "pixi.js";

export const AbilityHUD = (): Entity => {

  const width = 50;
  const height = 50;

  const squareQ = pixiRect({ w: width, h: height, y: 0, x: -150 });
  const squareW = pixiRect({ w: width, h: height, y: 0, x: -75 });
  const squareE = pixiRect({ w: width, h: height, y: 0, x: 0 });
  const squareR = pixiRect({ w: width, h: height, y: 0, x: 75 });

  const abilityHud = Entity<Renderable | Position>({
    id: "abilityHud",
    components: {
      position: new Position({ x: 0, y: 0, screenFixed: true }),
      renderable: new Renderable({
        setContainer: async (renderer) => {
          const canvasWidth = renderer.props.canvas.width;
          abilityHud.components.position.setPosition({ x: canvasWidth / 2, y: -100 })

          const c = new Container();

          // QWER hotkeys text bottom-left of squares
          const keyQ = pixiText({ text: "Q", pos: { x: -148, y: 35 } });
          const keyW = pixiText({ text: "W", pos: { x: -73, y: 35 } });
          const keyE = pixiText({ text: "E", pos: { x: 2, y: 35 } });
          const keyR = pixiText({ text: "R", pos: { x: 77, y: 35 } });

          const graphicsQ = pixiText({ text: "wall", fontSize: 18, pos: { x: -141, y: 10 } });

          c.addChild(squareQ, keyQ, squareW, keyW, squareE, keyE, squareR, keyR, graphicsQ);
          return c;
        },
        dynamic: (_, __, ___, w) => {
          const playerEntity = w.client?.playerId ? w.entities[w.client.playerId] : undefined;
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
