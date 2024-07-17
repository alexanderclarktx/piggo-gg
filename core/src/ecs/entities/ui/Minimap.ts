import { Action, Actions, Debug, Entity, Input, Position, Renderable, TeamColors, pixiGraphics } from "@piggo-gg/core";
import { Container } from "pixi.js";

export const Minimap = (dim: number, tileMap: number[]): Entity => {
  let scale = 0.5;
  let fullscreen = false;

  const container = new Container();
  const tileGraphics = pixiGraphics({ alpha: 0.9, rotation: Math.PI / 4 });
  const background = pixiGraphics();
  const mask = background.clone();
  const outline = pixiGraphics();
  const playerDot = pixiGraphics().circle(0, 0, 3).fill({ color: 0x00ff00 });

  background.circle(0, 0, 100).fill({ color: 0x000000, alpha: 0.4 });  
  outline.circle(0, 0, 100).stroke({ color: 0xffffff, width: 2, alpha: 0.9 });

  const Colors: Record<number, number> = {
    37: TeamColors[1],
    64: TeamColors[2],
    19: 0xffccaa
  }

  const minimap = Entity<Position | Renderable>({
    id: "minimap",
    components: {
      position: Position({ x: -125, y: 125, screenFixed: true }),
      debug: Debug(),
      input: Input({
        press: { "capslock": ({ world }) => ({ action: "toggleFS", playerId: world.client?.playerId() }) }
      }),
      actions: Actions({
        toggleFS: Action(({ world }) => {
          fullscreen = !fullscreen;
          if (fullscreen) {
            tileGraphics.mask = null;
            tileGraphics.scale = 1.5;

            // const bounds = tileGraphics.getLocalBounds();

            const x = (world.renderer?.app.canvas.width ?? 0) / 2;
            const y = (world.renderer?.app.canvas.height ?? 0) / 2;
            minimap.components.position = Position({ x, y, screenFixed: true });

            background.clear();
            outline.clear();
          } else {
            minimap.components.position = Position({ x: -125, y: 125, screenFixed: true });
            tileGraphics.mask = mask;
            tileGraphics.scale = 1;
            background.circle(0, 0, 100).fill({ color: 0x000000, alpha: 0.4 });
            outline.circle(0, 0, 100).stroke({ color: 0xffffff, width: 2, alpha: 0.9 });
          }
        }),
      }),
      renderable: Renderable({
        zIndex: 10,
        dynamic: (_, __, ___, w) => {
          const entityId = w.client?.playerEntity.components.controlling.data.entityId;
          if (!entityId) return;

          const entity = w.entities[entityId];
          if (!entity) return;

          const { position } = entity.components;
          if (!position) return;

          // update positions
          if (fullscreen) {
            const offset = [0, -(w.renderer?.app.canvas.height ?? 1) / 2]
            tileGraphics.position.set(...offset);

            const playerOffset = [position.data.x / 7.6 - 4, offset[1] + position.data.y / 3.8 + 2];
            playerDot.position.set(...playerOffset);
          } else {
            playerDot.position.set(0, 0);

            const offset = [-position.data.x / 5.6 * scale + 5, - position.data.y / 2.8 * scale + 2]
            tileGraphics.position.set(...offset);
          }
        },
        setContainer: async () => {
          // mask
          tileGraphics.mask = mask;

          // draw the tiles
          const width = 8 * scale;
          let color = 0xccccff

          // draw the tiles
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
