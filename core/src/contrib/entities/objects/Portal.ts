import { Actions, Clickable, Entity, Networked, Position, Renderable, loadTexture, pixiText } from "@piggo-gg/core";
import { OutlineFilter } from "pixi-filters";
import { Matrix, Sprite } from "pixi.js";

export type PortalProps = {
  pos: { x: number, y: number }
  game: string
  tint?: number
}

export const Portal = ({ pos, game, tint }: PortalProps): Entity => {
  const portal = Entity<Renderable>({
    id: `portal-${game}`,
    components: {
      position: new Position(pos),
      networked: new Networked({ isNetworked: true }),
      actions: new Actions<{ game: string }>({
        click: {
          invoke: ({ world, params }) => {
            console.log("change game to", params.game);
            // world.setGame(params.game);
          }
        }
      }),
      clickable: new Clickable({
        active: true,
        width: 256,
        height: 128,
        hoverOver: () => {
          const outlineFilter = new OutlineFilter({ thickness: 0.1, color: 0xffff00 });
          portal.components.renderable.c.filters = [outlineFilter];
        },
        hoverOut: () => {
          portal.components.renderable.c.filters = []
        },
        click: ({ world }) => ({ action: "click", playerId: world.client?.playerId, params: { game } }),
      }),
      renderable: new Renderable({
        zIndex: 1,
        color: tint ?? 0xffffff,
        setContainer: async () => {
          const textures = await loadTexture("portal.json");
          const sprite = new Sprite({ texture: textures["portal"] });
          sprite.setFromMatrix(new Matrix(2, 0, 0, 1, 0, 0));

          const t = pixiText({
            text: game,
            pos: { x: 64, y: 64 },
            anchor: { x: 0.5, y: 0.5 },
            style: { fill: 0xffffff, fontSize: 14 }
          });
          sprite.addChild(t);
          return sprite;
        }
      })
    }
  });
  return portal;
}
