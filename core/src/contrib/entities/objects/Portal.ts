import { Clickable, Debug, Entity, Position, Renderable, loadTexture } from "@piggo-gg/core";
import { OutlineFilter } from "pixi-filters";
import { Sprite, Matrix } from "pixi.js";

export type PortalProps = {
  pos: { x: number, y: number }
  game: string
}

export const Portal = ({ pos, game }: PortalProps): Entity => {
  const portal = Entity<Renderable>({
    id: `portal-${game}`,
    components: {
      position: new Position(pos),
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
        click: {
          apply: ({ world }) => {
            world.setGame(game);
          }
        }
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
