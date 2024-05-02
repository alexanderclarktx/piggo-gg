import { Actions, Clickable, Collider, Debug, Entity, Networked, Position, Renderable, genHash, loadTexture } from "@piggo-gg/core";
import { OutlineFilter } from "pixi-filters";
import { Sprite } from "pixi.js";
import toast from "react-hot-toast";

export type InviteStoneProps = {
  pos: { x: number, y: number }
  tint?: number
}

export const InviteStone = ({ pos, tint }: InviteStoneProps): Entity => {
  const portal = Entity<Renderable>({
    id: `dungeonobject`,
    components: {
      position: new Position(pos),
      debug: new Debug(),
      networked: new Networked({ isNetworked: true }),
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
          invoke: () => {
            const code = `https://piggo.gg/?join=${genHash(7)}`;
            navigator.clipboard.writeText(code);
            toast.success(`Copied Invite Code`);
            console.log(`Copied Invite Code: ${code}`);
            // alert(`Copied Invite Code: ${code}`);
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
          const textures = await loadTexture("dungeons.json");
          const sprite = new Sprite({ texture: textures["light"] });
          sprite.anchor.set(0.5, 0.5);
          return sprite;
        }
      })
    }
  });
  return portal;
}
