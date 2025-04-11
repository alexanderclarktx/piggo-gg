import { Entity, Position, Renderable, ClientSystemBuilder, values, max, rotateGlobal } from "@piggo-gg/core"

export const RenderSystem = ClientSystemBuilder({
  id: "RenderSystem",
  init: (world) => {
    const { renderer } = world

    const renderNewEntity = async (entity: Entity<Renderable | Position>) => {
      const { renderable, position } = entity.components

      await renderable._init(renderer, world)

      if (position) renderable.c.position.set(
        position.data.x + renderable.position.x,
        position.data.y + renderable.position.y
      )

      if (position.screenFixed) {
        renderer?.addGui(renderable)
      } else {
        renderer?.addWorld(renderable)
      }
    }

    // updates the position of screenFixed entities
    const updateScreenFixed = (entity: Entity<Renderable | Position>) => {
      const { position, renderable } = entity.components
      if (!position.screenFixed) return

      if (position.data.x < 0) {
        renderable.c.x = renderer!.app.screen.width + position.data.x
      } else {
        renderable.c.x = position.data.x
      }

      if (position.data.y < 0) {
        renderable.c.y = renderer!.app.screen.height + position.data.y
      } else {
        renderable.c.y = position.data.y
      }
    }

    return {
      id: "RenderSystem",
      query: ["renderable", "position"],
      priority: 9,
      onTick: (entities: Entity<Renderable | Position>[]) => {
        if (!renderer) return

        if (renderer.resizedFlag) {
          renderer.guiRenderables.forEach((renderable) => {
            renderer.app.stage.removeChild(renderable.c)
            renderable.rendered = false
          })

          renderer.resizedFlag = false
        }

        entities.forEach((entity) => {
          const { position, renderable } = entity.components

          // render if skin changed
          if (renderable.currentSkin !== renderable.data.desiredSkin) {
            renderable.c.removeChildren()
            renderable.rendered = false
          }

          // render if new entity
          if (!renderable.rendered) {
            renderNewEntity(entity)
            renderable.rendered = true
          }

          // update rotation
          if (renderable.rotates) {
            renderable.c.rotation = position.data.rotation
          }

          // update position
          const { x, y } = rotateGlobal(
            renderable.position.x + position.data.x,
            renderable.position.y + position.data.y,
            renderer.camera.angle
          )
          renderable.c.position.set(x, y - position.data.z)

          // update tint
          renderable.c.tint = renderable.color

          // set buffered ortho animation
          if (!renderable.bufferedAnimation) {
            renderable.bufferedAnimation = renderable.animationSelect ? renderable.animationSelect(entity, world) : position.orientation
          }

          // handle buffered animations
          if (
            renderable.bufferedAnimation !== renderable.activeAnimation &&
            renderable.animations[renderable.bufferedAnimation]
          ) {
            // remove current animation
            if (renderable.animation) renderable.c.removeChild(renderable.animation)

            // set new animation
            renderable.animation = renderable.animations[renderable.bufferedAnimation]

            // add animation to container
            renderable.c.addChild(renderable.animation)

            // play the animation
            renderable.animation.gotoAndPlay(0)

            // set activeAnimation
            renderable.activeAnimation = renderable.bufferedAnimation
            renderable.bufferedAnimation = ""
          }

          // reset buffered animation
          if (renderable.bufferedAnimation === renderable.activeAnimation) {
            renderable.bufferedAnimation = ""
          }

          // run the dynamic callback
          if (renderable.dynamic && renderable.initialized) renderable.dynamic({
            container: renderable.c, entity, world, renderable, client: world.client!
          })

          // set visible
          if (renderable.c.renderable !== renderable.visible) renderable.c.renderable = renderable.visible

          // run dynamic on children
          if (renderable.children && renderable.initialized) {
            renderable.children.forEach((child) => {
              if (child.dynamic) child.dynamic({ container: child.c, entity, world, renderable: child, client: world.client! })
            })
          }
        })

        // sort cache by position (closeness to camera)
        const sortedEntityPositions = values(entities).sort((a, b) => (
          (a.components.renderable.c.position.y + a.components.position.data.z) -
          (b.components.renderable.c.position.y + b.components.position.data.z)
          // (a.components.position.data.y + a.components.position.data.z) -
          // (b.components.position.data.y + b.components.position.data.z)
        ))

        // sort entities by zIndex
        sortedEntityPositions.forEach((entity, index) => {
          const renderable = entity.components.renderable
          if (renderable) {
            renderable.c.zIndex = renderable.zIndex + 0.0001 * index
          }
        })

        // update screenFixed entities
        world.queryEntities<Renderable | Position>(["renderable", "position"]).forEach((entity) => {
          updateScreenFixed(entity)
        })
      },
      onRender(entities: Entity<Renderable | Position>[], delta) {
        for (const entity of entities) {

          const { position, renderable } = entity.components

          // ui renderables
          if (position.screenFixed) {
            if (!renderable.interpolate) continue
            updateScreenFixed(entity)
          }

          // world renderables
          const { x, y, z, velocity } = position.data
          if ((velocity.x || velocity.y || velocity.z) && renderable.interpolate) {

            const interpolated = position.interpolate(delta, world)

            const rotated = rotateGlobal(
              x + renderable.position.x + interpolated.x,
              y + renderable.position.y + interpolated.y,
              renderer!.camera.angle
            )

            const newZ = max(0, z + interpolated.z)
            renderable.c.position.set(rotated.x, rotated.y - newZ)
          }
        }
      }
    }
  }
})
