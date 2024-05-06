import { Entity, Position, Renderable, ClientSystemBuilder, orthoToDirection } from "@piggo-gg/core";

// RenderSystem handles rendering entities in isometric or cartesian space
export const RenderSystem = ClientSystemBuilder({
  id: "RenderSystem",
  init: ({ world }) => {
    if (!world.renderer) return undefined;

    const renderer = world.renderer;
    let centeredEntity: Entity<Renderable | Position> | undefined = undefined;

    renderer.app.ticker.add(() => {
      if (centeredEntity) {
        const p = centeredEntity.components.position;
        if (p) renderer.camera.moveTo(p.data);
      }

      // update screenFixed entities
      Object.values(world.entities).forEach((entity) => {
        if (entity.components.renderable && entity.components.position) {
          updateScreenFixed(entity as Entity<Renderable | Position>);
        }
      });
    });

    const renderNewEntity = async (entity: Entity<Renderable | Position>) => {
      const { renderable, position } = entity.components;

      await renderable._init(renderer);

      if (position) {
        renderable.c.position.set(
          position.data.x + renderable.position.x,
          position.data.y + renderable.position.y
        );
      }

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

        entities.forEach((entity) => {
          const { position, renderable, controlled } = entity.components;

          // add new entities to the renderer
          if (!renderable.rendered) {
            renderable.rendered = true;
            renderNewEntity(entity);
          }

          // center this entity if controlled by player
          if (controlled && position && centeredEntity !== entity && controlled.data.entityId === world.client?.playerId) {
            centeredEntity = entity;
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
      }
    }
  }
});
