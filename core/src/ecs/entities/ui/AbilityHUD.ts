import { Entity, Position, Renderable, pixiRect, pixiText } from "@piggo-gg/core";

type AbilityStrings = [string, string, string, string];

export const AbilityHUD = (keys: AbilityStrings, labels: AbilityStrings): Entity => {

  const width = 50;
  const height = 50;

  const square1 = pixiRect({ w: width, h: height, y: 0, x: -150 });
  const square2 = pixiRect({ w: width, h: height, y: 0, x: -75 });
  const square3 = pixiRect({ w: width, h: height, y: 0, x: 0 });
  const square4 = pixiRect({ w: width, h: height, y: 0, x: 75 });

  const abilityHud = Entity<Renderable | Position>({
    id: "abilityHud",
    components: {
      position: new Position({ x: 0, y: 0, screenFixed: true }),
      renderable: new Renderable({
        setup: async (renderable, renderer) => {
          const canvasWidth = renderer.props.canvas.width;
          abilityHud.components.position.setPosition({ x: canvasWidth / 2, y: -100 })

          // hotkey text
          const key1 = pixiText({ text: keys[0], pos: { x: -148, y: 35 } });
          const key2 = pixiText({ text: keys[1], pos: { x: -73, y: 35 } });
          const key3 = pixiText({ text: keys[2], pos: { x: 2, y: 35 } });
          const key4 = pixiText({ text: keys[3], pos: { x: 77, y: 35 } });

          // ability labels
          const label1 = pixiText({ text: labels[0], pos: { x: -141, y: 10 }, style: { fontSize: 18 } });
          const label2 = pixiText({ text: labels[1], pos: { x: -70, y: 11 }, style: { fontSize: 16 } });
          const label3 = pixiText({ text: labels[2], pos: { x: 5, y: 11 }, style: { fontSize: 16 } });
          const label4 = pixiText({ text: labels[3], pos: { x: 80, y: 11 }, style: { fontSize: 16 } });

          renderable.c.addChild(square1, square2, square3, square4, key1, key2, key3, key4, label1, label2);
        },
        dynamic: (_, __, ___, w) => {
          const playerEntity = w.client?.playerEntity;
          if (!playerEntity) return;

          const controlledEntity = w.entities[playerEntity.components.controlling?.data.entityId ?? -1];
          if (!controlledEntity) return;

          const ability1 = controlledEntity.components.actions?.actionMap[labels[0]];
          if (!ability1 || !ability1.cdLeft || !ability1.cooldown) return;

          const qCooldownRatio = ability1.cdLeft / ability1.cooldown;
          square1.tint = (255 << 16) + (255 << 8) + (1 - qCooldownRatio) * 255;
        },
        zIndex: 10
      })
    }
  });

  return abilityHud;
}
