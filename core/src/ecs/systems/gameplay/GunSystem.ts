import { Entity, Gun, Position, Renderable, SystemBuilder, loadTexture, values } from "@piggo-gg/core";
import { OutlineFilter } from "pixi-filters";
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
  init: ({ world }) => {

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
            const { pointing } = e.components.position.data;

            r.position = pz[pointing];
            r.bufferedAnimation = pointing.toString();
          },
          setup: async (r: Renderable) => {
            const textures = await loadTexture("pistol.json");

            r.animations = {
              "0": new AnimatedSprite([textures["pistol0"]]),
              "1": new AnimatedSprite([textures["pistol1"]]),
              "2": new AnimatedSprite([textures["pistol2"]]),
              "3": new AnimatedSprite([textures["pistol3"]]),
              "4": new AnimatedSprite([textures["pistol4"]]),
              "5": new AnimatedSprite([textures["pistol5"]]),
              "6": new AnimatedSprite([textures["pistol6"]]),
              "7": new AnimatedSprite([textures["pistol7"]]),
            }

            values(r.animations).forEach((animation) => {
              animation.filters = [new OutlineFilter({ thickness: 1, color: 0x000000 })]
            })
          }
        })
      }
    });

    return {
      id: "gun",
      query: ["gun"],
      onTick: (entities: Entity<Gun | Position>[]) => {
        entities.forEach((entity) => {

          const { gun } = entity.components;

          // clean up old guns
          if (entity.components.gun.data.id !== playerToGun[entity.id]) {
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
        });
      }
    }
  }
})
