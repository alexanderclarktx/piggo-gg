import { Actions, Clickable, Entity, Networked, Position, Renderable, loadTexture } from "@piggo-gg/core";
import { OutlineFilter } from "pixi-filters";
import { Matrix, Sprite } from "pixi.js";

export type PortalProps = {
  pos: { x: number, y: number }
  game: string
}

export const Portal = ({ pos, game }: PortalProps): Entity => {
  const portal = Entity<Renderable>({
    id: `portal-${game}`,
    components: {
      position: new Position(pos),
      networked: new Networked({ isNetworked: true }),
      actions: new Actions<{ game: string }>({
        click: {
          invoke: ({ world, params }) => {
            world.setGame(params.game);
          }
        }
      }),
      clickable: new Clickable({
        active: true,
        width: 256,
        height: 128,
        hoverOver: () => {
          portal.components.renderable.c.filters = [new OutlineFilter({ thickness: 0.1, color: 0xffffff })]
        },
        hoverOut: () => {
          portal.components.renderable.c.filters = []
        },
        click: () => ({ action: "click", params: { game } }),
      }),
      renderable: new Renderable({
        zIndex: 1,
        setContainer: async () => {
          const textures = await loadTexture("portal.json");
          const sprite = new Sprite({ texture: textures["portal"] });
          sprite.setFromMatrix(new Matrix(2, 0, 0, 1, 0, 0));
          return sprite;
        }
      })
    }
  });
  return portal;
}
