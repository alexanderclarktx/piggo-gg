import { Entity, Position, Renderable, ClientSystemBuilder, orthoToDirection } from "@piggo-gg/core";

// RenderSystem handles rendering entities to the screen
export const RenderSystem = ClientSystemBuilder({
  id: "RenderSystem",
  init: ({ world }) => {
    if (!world.renderer) return undefined;

    const renderer = world.renderer;
    let lastOntick = Date.now();
    let centeredEntity: Entity<Renderable | Position> | undefined = undefined;

    const renderNewEntity = async (entity: Entity<Renderable | Position>) => {
      const { renderable, position } = entity.components;

      await renderable._init(renderer);

      if (position) renderable.c.position.set(
        position.data.x + renderable.position.x,
        position.data.y + renderable.position.y
      );

      if (position.screenFixed) {
        renderer.addGui(renderable);
      } else {
        renderer.addWorld(renderable);
      }
    }

    // updates the position of screenFixed entities
    const updateScreenFixed = (entity: Entity<Renderable | Position>) => {
      const { position, renderable } = entity.components;
      if (!position.screenFixed) return;

      if (position.data.x < 0) {
        renderable.c.x = renderer.app.screen.width + position.data.x;
      } else {
        renderable.c.x = position.data.x;
      }

      if (position.data.y < 0) {
        renderable.c.y = renderer.app.screen.height + position.data.y;
      } else {
        renderable.c.y = position.data.y;
      }
    }

    return {
      id: "RenderSystem",
      query: ["renderable", "position"],
      onTick: (entities: Entity<Renderable | Position>[]) => {

        lastOntick = Date.now();

        const { x: cameraX, y: cameraY } = centeredEntity?.components.position.data ?? { x: 0, y: 0 };
        const { width, height } = renderer.app.screen;
        const cameraScale = renderer.camera.c.scale.x - 0.5;

        // todo this is calculating difference from centered entity, not the camera
        const isFarFromCamera = ({ x, y }: { x: number, y: number }) => {
          return Math.abs(x - cameraX) > (width / cameraScale / 2) || Math.abs(y - cameraY) > (height / cameraScale / 2);
        }

        entities.forEach((entity) => {
          const { position, renderable } = entity.components;

          // cull if far from camera
          if (!position.screenFixed && renderable.children) {
            renderable.children.forEach((child) => {
              if (child.c) child.visible = !isFarFromCamera({
                x: position.data.x + child.position.x,
                y: position.data.y + child.position.y
              });
            });
          }

          // render if new entity
          if (!renderable.rendered) {
            renderable.rendered = true;
            renderNewEntity(entity);
          }

          // update rotation
          if (renderable.rotates) {
            renderable.c.rotation = position.data.rotation;
          }

          // update position
          renderable.c.position.set(
            position.data.x + renderable.position.x,
            position.data.y + renderable.position.y
          );

          // set buffered ortho animation
          if (!renderable.bufferedAnimation) {
            renderable.bufferedAnimation = orthoToDirection(position.ortho);
          }

          // handle buffered animations
          if (
            renderable.bufferedAnimation !== renderable.activeAnimation &&
            renderable.animations[renderable.bufferedAnimation]
          ) {
            // remove current animation
            if (renderable.animation) renderable.c.removeChild(renderable.animation);

            // set new animation
            renderable.animation = renderable.animations[renderable.bufferedAnimation];

            // add animation to container
            renderable.c.addChild(renderable.animation);

            // play the animation
            renderable.animation.play();

            // set activeAnimation
            renderable.activeAnimation = renderable.bufferedAnimation;
            renderable.bufferedAnimation = "";
          }

          // reset buffered animation
          if (renderable.bufferedAnimation === renderable.activeAnimation) {
            renderable.bufferedAnimation = "";
          }

          // run the dynamic callback
          if (renderable.dynamic) renderable.dynamic(renderable.c, renderable, entity, world);

          // run dynamic on children
          if (renderable.children) {
            renderable.children.forEach((child) => {
              if (child.dynamic) child.dynamic(child.c, child, entity, world);
            });
          }
        });

        // center camera on player's controlled entity
        const playerEntity = world.client?.playerEntity;
        if (playerEntity) {
          const controlledEntity = world.entities[playerEntity.components.controlling.data.entityId] as Entity<Renderable | Position>;
          if (controlledEntity) centeredEntity = controlledEntity;
        }

        // sort cache by position (closeness to camera)
        const sortedEntityPositions = Object.values(entities).sort((a, b) => {
          return a.components.position.data.y - b.components.position.data.y;
        });

        // sort entities by zIndex
        sortedEntityPositions.forEach((entity, index) => {
          const renderable = entity.components.renderable;
          if (renderable) {
            renderable.c.zIndex = renderable.zIndex + 0.0001 * index;
          }
        });

        // update screenFixed entities
        Object.values(world.entities).forEach((entity) => {
          if (entity.components.renderable && entity.components.position) {
            updateScreenFixed(entity as Entity<Renderable | Position>);
          }
        });
      },
      onRender(entities: Entity<Renderable | Position>[]) {
        const elapsedTime = Date.now() - lastOntick;

        // interpolate entity positions
        entities.forEach((entity) => {
          const { position, renderable } = entity.components;
          if (position.screenFixed) {
            if (renderable.interpolate) {
              updateScreenFixed(entity as Entity<Renderable | Position>);
            } else return;
          }

          const { x, y, vx, vy } = position.data;

          if (centeredEntity && entity.id === centeredEntity.id) {
            renderer.camera.moveTo({ x, y });
          }

          const dx = vx * elapsedTime / 1000;
          const dy = vy * elapsedTime / 1000;

          if (((world.tick - position.lastCollided) > 4) && (vx || vy)) {
            renderable.c.position.set(
              x + dx + renderable.position.x,
              y + dy + renderable.position.y
            );

            if (centeredEntity && entity.id === centeredEntity.id) {
              renderer.camera.moveTo({ x: x + dx, y: y + dy });
            }
          }
        });
      },
    }
  }
});
