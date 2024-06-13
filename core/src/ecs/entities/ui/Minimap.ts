import { Entity, Position, Renderable, TeamColors, World, pixiCircle } from "@piggo-gg/core";
import { Container, Graphics, Matrix } from "pixi.js";

export const Minimap = (dim: number, tileArray: number[]): Entity => {
  const container = new Container();
  const tileGraphics = new Graphics({ alpha: 0.9, rotation: Math.PI / 4 });

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
          tileGraphics.position.set(-position.data.x / 5.6 + 5, - position.data.y / 2.8 + 2);
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
          const tileSize = 8;
          let color = 0xccccff
          tileArray.forEach((tile, i) => {
            if (tile === 0) return;
            color = 0xaaaacc;
            if (tile === 37) color = TeamColors[1];
            if (tile === 64) color = TeamColors[2];
            // if (tile === 19) color = 0xffccaa;
            const x = i % dim;
            const y = Math.floor(i / dim);

            tileGraphics.rect(x * tileSize, y * tileSize, tileSize, tileSize);
            console.log(color.toString(16));
            tileGraphics.fill({ color });
          });

          container.addChild(background, tileGraphics, outline, playerDot, mask);
          return container;
        }
      })
    }
  });

  return minimap;
}
