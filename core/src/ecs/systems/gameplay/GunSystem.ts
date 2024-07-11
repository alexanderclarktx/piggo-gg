import { Entity, Gun, Position, Renderable, SystemBuilder, loadTexture } from "@piggo-gg/core";
import { AnimatedSprite } from "pixi.js";

// ortho positions
const pz = [
  { x: -20, y: 0 }, { x: -20, y: -15 },
  { x: 0, y: -25 }, { x: 20, y: -15 },
  { x: 20, y: 0 }, { x: 15, y: 15 },
  { x: 0, y: 15 }, { x: -15, y: 15 }
]

export const GunSystem: SystemBuilder<"gun"> = ({
  id: "gun",
  init: (world) => {

    let playerToGun: Record<string, number> = {};
    let gunToRendered: Record<number, Entity<Renderable | Position>> = {};

    const draw = (player: Entity<Gun | Position>, gunId: number): Entity<Renderable | Position> => Entity({
      id: `${player.id}-gun${gunId}`,
      components: {
        position: player.components.position,
        renderable: Renderable({
          scaleMode: "nearest",
          zIndex: 2,
          scale: 2.5,
          anchor: { x: 0.5, y: 0.5 },
          position: { x: 20, y: 0 },
          interpolate: true,
          dynamic: (_, r, e: Entity<Gun | Position>) => {
            const { gun, position } = player.components;
            const { pointing } = position.data;

            r.position = pz[pointing];
            r.bufferedAnimation = pointing.toString();

            r.setOutline(gun.reloading ? 0xff0000 : gun.outlineColor);
          },
          setup: async (r: Renderable) => {
            const { gun } = player.components;
            const textures = await loadTexture(`${gun.name}.json`);

            r.animations = {
              "0": new AnimatedSprite([textures["0"]]),
              "1": new AnimatedSprite([textures["1"]]),
              "2": new AnimatedSprite([textures["2"]]),
              "3": new AnimatedSprite([textures["3"]]),
              "4": new AnimatedSprite([textures["4"]]),
              "5": new AnimatedSprite([textures["5"]]),
              "6": new AnimatedSprite([textures["6"]]),
              "7": new AnimatedSprite([textures["7"]]),
            }

            r.setOutline(gun.outlineColor);
          }
        })
      }
    });

    return {
      id: "gun",
      query: ["gun", "position", "renderable"],
      onTick: (entities: Entity<Gun | Position | Renderable>[]) => {
        entities.forEach((entity) => {

          const { gun, renderable } = entity.components;

          // clean up old guns
          if (gun.data.id !== playerToGun[entity.id]) {
            world.removeEntity(`${entity.id}-gun${playerToGun[entity.id]}`);
            delete playerToGun[entity.id];
          }

          // draw new guns
          if (!playerToGun[entity.id]) {
            const r = draw(entity, gun.data.id);
            world.addEntity(r);
            playerToGun[entity.id] = gun.data.id;
            gunToRendered[gun.data.id] = r;
          };

          // update gun visibility
          gunToRendered[gun.data.id].components.renderable.visible = renderable.visible;
        });
      }
    }
  }
})
