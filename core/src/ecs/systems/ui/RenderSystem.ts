import { Entity, Position, Renderable, ClientSystemBuilder, XY, values, Character, isMobile } from "@piggo-gg/core"

export const RenderSystem = ClientSystemBuilder({
  id: "RenderSystem",
  init: (world) => {
    if (!world.renderer) return undefined

    const { renderer } = world
    let lastOntick = Date.now()

    const renderNewEntity = async (entity: Entity<Renderable | Position>) => {
      const { renderable, position } = entity.components

      await renderable._init(renderer, world)

      if (position) renderable.c.position.set(
        position.data.x + renderable.position.x,
        position.data.y + renderable.position.y
      )

      if (position.screenFixed) {
        renderer.addGui(renderable)
      } else {
        renderer.addWorld(renderable)
      }
    }

    // updates the position of screenFixed entities
    const updateScreenFixed = (entity: Entity<Renderable | Position>) => {
      const { position, renderable } = entity.components
      if (!position.screenFixed) return

      if (position.data.x < 0) {
        renderable.c.x = renderer.app.screen.width + position.data.x
      } else {
        renderable.c.x = position.data.x
      }

      if (position.data.y < 0) {
        renderable.c.y = renderer.app.screen.height + position.data.y
      } else {
        renderable.c.y = position.data.y
      }
    }

    return {
      id: "RenderSystem",
      query: ["renderable", "position"],
      onTick: (entities: Entity<Renderable | Position>[]) => {

        lastOntick = performance.now()

        if (renderer.resizedFlag) {
          renderer.guiRenderables.forEach((renderable) => {
            renderer.app.stage.removeChild(renderable.c)
            renderable.rendered = false
          })

          renderer.resizedFlag = false
        }

        entities.forEach((entity) => {
          const { position, renderable } = entity.components

          // render if new entity
          if (!renderable.rendered) {
            renderable.rendered = true
            renderNewEntity(entity)
          }

          // update rotation
          if (renderable.rotates) {
            renderable.c.rotation = position.data.rotation
          }

          // update position
          renderable.c.position.set(
            position.data.x + renderable.position.x,
            position.data.y + renderable.position.y
          )

          renderable.c.tint = renderable.color

          // set buffered ortho animation
          if (!renderable.bufferedAnimation) {
            renderable.bufferedAnimation = position.orientation
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
            renderable.animation.play()

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
            container: renderable.c, entity, world, renderable
          })

          // set visible
          if (renderable.c.renderable !== renderable.visible) renderable.c.renderable = renderable.visible

          // run dynamic on children
          if (renderable.children && renderable.initialized) {
            renderable.children.forEach((child) => {
              if (child.dynamic) child.dynamic({ container: child.c, entity, world, renderable: child })
            })
          }
        })

        // sort cache by position (closeness to camera)
        const sortedEntityPositions = values(entities).sort((a, b) => {
          return a.components.renderable.c.position.y - b.components.renderable.c.position.y
        })

        // sort entities by zIndex
        sortedEntityPositions.forEach((entity, index) => {
          const renderable = entity.components.renderable
          if (renderable) {
            renderable.c.zIndex = renderable.zIndex + 0.0001 * index
          }
        })

        // update screenFixed entities
        values(world.entities).forEach((entity) => {
          if (entity.components.renderable && entity.components.position) {
            updateScreenFixed(entity as Entity<Renderable | Position>)
          }
        })
      },
      onRender(entities: Entity<Renderable | Position>[]) {
        const elapsedTime = performance.now() - lastOntick

        // interpolate entity positions
        entities.forEach((entity) => {
          const { position, renderable } = entity.components
          if (position.screenFixed) {
            if (renderable.interpolate) {
              updateScreenFixed(entity as Entity<Renderable | Position>)
            } else return
          }

          const { x, y, velocity } = position.data

          if (((world.tick - position.lastCollided) > 4) && (velocity.x || velocity.y) && renderable.interpolate) {

            const dx = velocity.x * elapsedTime / 1000
            const dy = velocity.y * elapsedTime / 1000

            renderable.c.position.set(
              x + dx + renderable.position.x,
              y + dy + renderable.position.y
            )
          }
        })
      }
    }
  }
})
