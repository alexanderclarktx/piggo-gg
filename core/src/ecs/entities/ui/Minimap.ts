import { Action, Actions, Debug, Entity, Input, Position, Renderable, TeamColors, keys, pixiGraphics, values } from "@piggo-gg/core";
import { Container, Graphics } from "pixi.js";

export const Minimap = (dim: number, tileMap: number[]): Entity => {
  let scale = 0.5;
  let fullscreen = false;

  const dots: Record<string, Graphics> = {};

  const container = new Container();
  const tileGraphics = pixiGraphics({ alpha: 0.9, rotation: Math.PI / 4 });
  const background = pixiGraphics();
  const mask = background.clone();
  const outline = pixiGraphics();

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
            values(dots).forEach((dot) => dot.mask = null);

            const bounds = tileGraphics.getBounds();

            const x = (world.renderer?.app.canvas.width ?? 0) / 2;
            const y = Math.max(0, ((world.renderer?.app.canvas.height ?? 0) - bounds.height) / 2 - 100);

            minimap.components.position.data.x = x;
            minimap.components.position.data.y = y;

            background.clear();
            outline.clear();
          } else {
            tileGraphics.mask = mask;
            tileGraphics.scale = 1;
            values(dots).forEach((dot) => dot.mask = mask);

            minimap.components.position.data.x = -125;
            minimap.components.position.data.y = 125;

            background.circle(0, 0, 100).fill({ color: 0x000000, alpha: 0.4 });
            outline.circle(0, 0, 100).stroke({ color: 0xffffff, width: 2, alpha: 0.9 });
          }
        }),
      }),
      renderable: Renderable({
        zIndex: 10,
        dynamic: (_, __, ___, w) => {

          // remove dots that are no longer in the world
          keys(dots).forEach((id) => {
            if (!w.entities[id]) {
              container.removeChild(dots[id]);
              delete dots[id];
            }
          });

          const playerCharacter = w.client?.playerCharacter();
          if (!playerCharacter) return;
          const playerPosition = playerCharacter.components.position;

          // update player dots
          w.queryEntities(["player"]).forEach((entity) => {

            if (!dots[entity.id]) {
              const color = (entity.id === w.client?.playerId()) ? 0x00ff00 : 0xff0000;
              dots[entity.id] = pixiGraphics().circle(0, 0, 3).fill({ color });
              dots[entity.id].mask = mask;
              container.addChild(dots[entity.id]);
            }

            const { controlling } = entity.components;
            if (!controlling) return;

            const character = w.entities[controlling.data.entityId];
            if (!character) return;

            const { position } = character.components;
            if (!position) return;

            if (fullscreen) dots[entity.id].position.set(position.data.x / 7.6 - 4, position.data.y / 3.8 + 2);

            if (!fullscreen) {
              if (entity.id === w.client?.playerId()) {
                dots[entity.id].position.set(0, 0);
              } else {
                dots[entity.id].position.set((position.data.x - playerPosition.data.x) * scale / 5.6, (position.data.y - playerPosition.data.y) * scale / 2.8);
              }
            }
          });

          // update tile graphic position
          if (fullscreen) {
            tileGraphics.position.set(0, 0);
          } else {
            tileGraphics.position.set(-playerPosition.data.x / 5.6 * scale + 5, - playerPosition.data.y / 2.8 * scale + 2);
          }
        },
        setContainer: async () => {

          background.circle(0, 0, 100).fill({ color: 0x000000, alpha: 0.4 });
          outline.circle(0, 0, 100).stroke({ color: 0xffffff, width: 2, alpha: 0.9 });

          tileGraphics.mask = mask;

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

          container.addChild(background, tileGraphics, outline, mask);
          return container;
        }
      })
    }
  });

  return minimap;
}
