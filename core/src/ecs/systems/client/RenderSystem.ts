import { Entity, Position, Renderable, ClientSystemBuilder, logPerf } from "@piggo-gg/core"

export const RenderSystem = ClientSystemBuilder({
  id: "RenderSystem",
  init: (world) => {
    const renderNewEntity = async (entity: Entity<Renderable | Position>) => {
      const { renderable, position } = entity.components

      await renderable._init(world.renderer, world)

      if (position.screenFixed) {
        world.renderer?.addGui(renderable)
      } else {
        world.renderer?.addWorld(renderable)
      }
    }

    // updates the position of screenFixed entities
    const updateScreenFixed = (entity: Entity<Renderable | Position>) => {
      const { position, renderable } = entity.components
      if (!position.screenFixed) return

      if (position.data.x < 0) {
        renderable.c.x = world.renderer!.app.screen.width + position.data.x
      } else {
        renderable.c.x = position.data.x
      }

      if (position.data.y < 0) {
        renderable.c.y = world.renderer!.app.screen.height + position.data.y
      } else {
        renderable.c.y = position.data.y
      }
    }

    return {
      id: "RenderSystem",
      query: ["renderable", "position"],
      priority: 11,
      onTick: (entities: Entity<Renderable | Position>[]) => {
        const { renderer, client } = world
        if (!renderer || !client) return

        if (renderer.resizedFlag) {
          renderer.guiRenderables.forEach((renderable) => {
            renderer.app.stage.removeChild(renderable.c)
            renderable.rendered = false
          })

          renderer.resizedFlag = false
        }

        const time = performance.now()
        for (const entity of entities) {
          const { position, renderable } = entity.components

          // render if skin changed
          if (renderable.currentSkin && renderable.currentSkin !== renderable.data.desiredSkin) {
            renderable.c.removeChildren()
            renderable.rendered = false
          }

          // render if new entity
          if (!renderable.rendered) {
            renderNewEntity(entity)
            renderable.rendered = true
          }

          // run dynamic callback
          if (renderable.onTick && renderable.initialized) renderable.onTick({
            container: renderable.c, entity, world, renderable, client
          })

          // run dynamic callback for children
          if (renderable.children && renderable.initialized) {
            for (const child of renderable.children) {
              if (!child.rendered) {
                if (!child.obedient) {
                  position.screenFixed ? renderer?.addGui(child) : renderer?.addWorld(child)
                }
                child.rendered = true
              } else {
                child.onTick?.({ container: child.c, entity, world, renderable: child, client })
              }
            }
          }

          // update rotation
          if (renderable.rotates) {
            renderable.c.rotation = position.data.rotation
          }

          // update position
          const { x, y } = {
            x: renderable.position.x + position.data.x,
            y: renderable.position.y + position.data.y
          }
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

          // set visible
          if (renderable.c.renderable !== renderable.visible) renderable.c.renderable = renderable.visible
        }
        logPerf("render loop", time)

        // sort entities by position (closeness to camera)
        entities = entities.filter(x => x.components.renderable.visible)
        entities.sort((a, b) => a.components.position.data.y - b.components.position.data.y)

        // set zIndex
        for (const [index, entity] of entities.entries()) {
          const { renderable } = entity.components
          renderable.c.zIndex = renderable.zIndex + 0.0001 * index
        }

        // update screenFixed entities
        for (const entity of world.queryEntities<Renderable | Position>(["renderable", "position"])) {
          updateScreenFixed(entity)
        }
      },
      onRender(entities: Entity<Renderable | Position>[], delta) {
        const { renderer, client } = world
        if (!renderer || !client) return

        for (const entity of entities) {
          const { position, renderable } = entity.components

          if (renderable.onRender && renderable.initialized) {
            renderable.onRender({ container: renderable.c, client, delta, entity, renderable, world })
          }

          // children onRender
          if (renderable.children && renderable.initialized) {
            for (const child of renderable.children) {
              child.onRender?.({ container: child.c, entity, world, renderable: child, client, delta })
            }
          }

          if (!renderable.rendered || !renderable.interpolate) continue

          // UI renderables
          if (position.screenFixed) {
            updateScreenFixed(entity)
          }

          // world renderables
          const { velocity } = position.data
          if ((velocity.x || velocity.y || velocity.z)) {

            const interpolated = position.interpolate(world, delta)

            const offset = {
              x: renderable.position.x + interpolated.x,
              y: renderable.position.y + interpolated.y,
            }

            renderable.c.position.set(offset.x, offset.y - interpolated.z)
          }
        }
      }
    }
  }
})
