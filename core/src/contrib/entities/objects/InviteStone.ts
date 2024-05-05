import { Actions, Clickable, Collider, Debug, Entity, Position, Renderable, loadTexture } from "@piggo-gg/core";
import { OutlineFilter } from "pixi-filters";
import { Sprite } from "pixi.js";
import toast from "react-hot-toast";

export type InviteStoneProps = {
  pos: { x: number, y: number }
  tint?: number
}

export const InviteStone = ({ pos, tint }: InviteStoneProps): Entity => {
  const portal = Entity<Renderable>({
    id: `invite-stone`,
    components: {
      position: new Position(pos),
      debug: new Debug(),
      collider: new Collider({
        shape: "line", points: [
          -32, 8,
          0, -8,
          32, 8,
          0, 24,
          -32, 8
        ]
      }),
      actions: new Actions({
        click: {
          invoke: ({ world }) => {
            if (!world.client) return;

            let url = "";
            if (world.client.lobbyId) {
              url = `https://piggo.gg/?join=${world.client.lobbyId}`;
              navigator.clipboard.writeText(url);
              toast.success(`Copied Invite URL`);
            } else {
              world.client.createLobby((response) => {
                url = `https://piggo.gg/?join=${response.lobbyId}`;
                navigator.clipboard.writeText(url);
                toast.success(`Copied Invite URL`);
              });
            }
          }
        }
      }),
      clickable: new Clickable({
        active: true,
        anchor: { x: 0.5, y: 0.5 },
        width: 64,
        height: 48,
        hoverOver: () => {
          portal.components.renderable.c.filters = [new OutlineFilter({ thickness: 0.1, color: 0xffff00 })]
        },
        hoverOut: () => {
          portal.components.renderable.c.filters = []
        }
      }),
      renderable: new Renderable({
        zIndex: 3,
        color: tint ?? 0xffffff,
        setContainer: async () => {
          const textures = await loadTexture("dungeon-objects.json");
          const sprite = new Sprite({ texture: textures["invite-stone"] });
          sprite.anchor.set(0.5, 0.5);
          return sprite;
        }
      })
    }
  });
  return portal;
}
