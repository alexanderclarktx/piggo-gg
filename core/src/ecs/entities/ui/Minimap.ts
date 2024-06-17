import { Entity, Position, Renderable, TeamColors } from "@piggo-gg/core";
import { Container, Graphics } from "pixi.js";

export const Minimap = (dim: number, tileMap: number[]): Entity => {
  const container = new Container();
  const tileGraphics = new Graphics({ alpha: 0.9, rotation: Math.PI / 4 });

  let scale = 0.5;

  const Colors: Record<number, number> = {
    37: TeamColors[1],
    64: TeamColors[2],
    19: 0xffccaa
  }

  const minimap = Entity({
    id: "minimap",
    components: {
      position: Position({ x: -125, y: 125, screenFixed: true }),
      renderable: Renderable({
        zIndex: 10,
        dynamic: (_, __, ___, w) => {
          const entityId = w.client?.playerEntity.components.controlling.data.entityId;
          if (!entityId) return;

          const entity = w.entities[entityId];
          if (!entity) return;

          const { position } = entity.components;
          if (!position) return;
          tileGraphics.position.set(-position.data.x / 5.6 * scale + 5, - position.data.y / 2.8 * scale + 2);
        },
        setContainer: async () => {

          // background
          const background = new Graphics();
          background.circle(0, 0, 100).fill({ color: 0x000000, alpha: 0.4 })

          // outline
          const outline = new Graphics();
          outline.circle(0, 0, 100).stroke({ color: 0xffffaa, width: 2 });

          // mask
          const mask = background.clone();
          tileGraphics.mask = mask;

          // player dot
          const playerDot = new Graphics();
          playerDot.circle(0, 0, 3).fill({ color: 0x00ff00 });

          // draw the tiles
          const width = 8 * scale;
          let color = 0xccccff
          tileMap.forEach((tile, i) => {
            if (tile === 0) return;

            color = Colors[tile] || 0xccccff;

            const x = i % dim;
            const y = Math.floor(i / dim);

            tileGraphics.rect(x * width, y * width, width, width).fill({ color });
          });

          container.addChild(background, tileGraphics, outline, playerDot, mask);
          return container;
        }
      })
    }
  });

  return minimap;
}
