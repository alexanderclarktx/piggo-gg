import { Collider, Debug, Entity, NPC, Networked, Position, Renderable, XY, loadTexture } from "@piggo-gg/core";
import { Sprite } from "pixi.js";

export type TreeProps = {
  id: string
  position?: XY
}

export const Tree = ({ position, id }: TreeProps) => Entity({
  id: id,
  components: {
    position: Position(position ?? { x: 50, y: 250 }),
    networked: Networked({ isNetworked: true }),
    collider: Collider({
      shape: "ball",
      isStatic: true,
      radius: 11
    }),
    debug: Debug(),
    npc: NPC({
      npcOnTick: (e: Entity<Position>) => {
        const { x, y } = e.components.position.data.velocity;
        e.components.position.data.rotation += 0.001 * Math.sqrt((x * x) + (y * y));
      }
    }),
    renderable: Renderable({
      zIndex: 3,
      scale: 3,
      scaleMode: "nearest",
      setup: async (r: Renderable) => {

        const texture = (await loadTexture("c_tiles.json"))["tree"];
        const sprite = new Sprite(texture);

        sprite.anchor.set(0.5, 0.7);

        r.c = sprite;
      }
    })
  }
});
