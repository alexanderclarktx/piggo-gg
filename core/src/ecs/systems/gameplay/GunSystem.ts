import { Debug, Entity, Gun, Position, Renderable, SystemBuilder, XY, loadTexture } from "@piggo-gg/core";
import { AnimatedSprite, PerspectiveMesh, Texture } from "pixi.js";

// ortho positions
const pz = [
  { x: -20, y: 0 }, { x: -20, y: -15 },
  { x: 0, y: -25 }, { x: 20, y: -15 },
  { x: 20, y: 0 }, { x: 15, y: 15 },
  { x: 0, y: 15 }, { x: -15, y: 15 }
]

function rotate3D(points: XY[], outPoints: XY[], angleX: number, angleY: number, perspective: number, texture: Texture) {
  const radX = angleX * Math.PI / 180;
  const radY = angleY * Math.PI / 180;
  const cosX = Math.cos(radX);
  const sinX = Math.sin(radX);
  const cosY = Math.cos(radY);
  const sinY = Math.sin(radY);

  for (let i = 0; i < points.length; i++) {
    const src = points[i];
    const out = outPoints[i];
    const x = src.x - texture.width / 2;
    const y = src.y - texture.height / 2;
    let z = 0; // Assume initial z is 0 for this 2D plane

    // Rotate around Y axis
    const xY = cosY * x - sinY * z;
    z = sinY * x + cosY * z;

    // Rotate around X axis
    const yX = cosX * y - sinX * z;
    z = sinX * y + cosX * z;

    // Apply perspective projection
    // const scale = perspective / (perspective - z);
    const scale = 1;

    out.x = xY * scale + texture.width / 2;
    out.y = yX * scale + texture.height / 2;
  }
}

export const GunSystem: SystemBuilder<"gun"> = ({
  id: "gun",
  init: (world) => {

    let playerToGun: Record<string, number> = {};
    let gunToRendered: Record<number, Entity<Renderable | Position>> = {};

    const draw = (player: Entity<Gun | Position>, gunId: number): Entity<Renderable | Position> => Entity({
      id: `${player.id}-gun${gunId}`,
      components: {
        position: player.components.position,
        debug: Debug(),
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
          setup: async (r: Renderable, renderer) => {
            const { gun } = player.components;
            const textures = await loadTexture(`${gun.name}.json`) as Record<string, Texture>;

            const makeMesh = (texture: Texture) => new PerspectiveMesh({
              texture,
              pivot: { x: texture.width / 2, y: texture.height / 2 },
              width: texture.width,
              height: texture.height,
              // scale: 4
            });

            r.animations = {
              "0": makeMesh(textures["0"]),
              "1": makeMesh(textures["0"]),
              "2": makeMesh(textures["0"]),
              "3": makeMesh(textures["0"]),
              "4": makeMesh(textures["0"]),
              "5": makeMesh(textures["0"]),
              "6": makeMesh(textures["0"]),
              "7": makeMesh(textures["0"])
            }

            world.renderer?.app.canvas.addEventListener('pointermove', (e) => {

              const mesh = r.animations[r.bufferedAnimation] as PerspectiveMesh;

              const { x, y } = renderer.camera.toWorldCoords({ x: e.offsetX, y: e.offsetY })

              const playerPosition = player.components.position.data;

              // const angleX = x - playerPosition.x;
              // const angleY = y - playerPosition.y;

              const texture = textures[r.bufferedAnimation];

              const points = [
                { x: 0, y: 0 },
                { x: texture.width, y: 0 },
                { x: texture.width, y: texture.height },
                { x: 0, y: texture.height },
              ];

              const outPoints = points.map(p => ({ ...p }));

              const angleX = (x - playerPosition.x);
              const angleY = (y - playerPosition.y);

              console.log(angleX, angleY);

              rotate3D(points, outPoints, angleX, angleY, 300, texture);
              console.log(JSON.stringify(points))
              // console.log([
              //   outPoints[0].x, outPoints[0].y,
              //   outPoints[1].x, outPoints[1].y,
              //   outPoints[2].x, outPoints[2].y,
              //   outPoints[3].x, outPoints[3].y,
              // ])
              mesh.setCorners(
                8, 0,
                8, 0,
                8, 6,
                0, 6
                // {"x":0,"y":0},{"x":8,"y":0},{"x":8,"y":6},{"x":0,"y":6}
                // outPoints[0].x, outPoints[0].y,
                // outPoints[1].x, outPoints[1].y,
                // outPoints[2].x, outPoints[2].y,
                // outPoints[3].x, outPoints[3].y,

              );
            });
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
