import {
  ClientSystemBuilder, DebugBounds, Entity, FpsText, Component,
  Position, Renderable, TextBox, values, keys, pixiGraphics
} from "@piggo-gg/core"
import { Graphics, Text } from "pixi.js"

export type Debug = Component<"debug">

export const Debug = (): Debug => (
  { type: "debug" }
)

// DebugSystem adds visual debug information to renderered entities
export const DebugSystem = ClientSystemBuilder({
  id: "DebugSystem",
  init: (world) => {
    let debugRenderables: Renderable[] = []
    let debugEntitiesPerEntity: Record<string, Entity<Renderable | Position>[]> = {}

    const rmDebug = (id: string) => {
      const debugEntities = debugEntitiesPerEntity[id]
      debugEntities?.forEach((debugEntity) => {
        world.removeEntity(debugEntity.id)
        delete debugEntitiesPerEntity[id]
      })
    }

    const addDebug = (entity: Entity<Renderable | Position>) => {
      const { renderable, position } = entity.components

      // text box
      const textBox = TextBox({
        onTick: ({ container, renderable }) => {
          const c = container as Text
          if (renderable && position) {
            const bounds = renderable.c.getLocalBounds()
            c.position.set(bounds.x, bounds.top - 25)
            c.text = debugText(position)
            renderable.visible = renderable.visible
          }
        },
        fontSize: 8, color: 0x00ff00
      })

      const lineToHeading = Renderable({
        onTick: ({ container }) => {
          const c = container as Graphics
          if (position.data.heading.x || position.data.heading.y) {
            c.clear().setStrokeStyle({ width: 1, color: 0x00ffff })
            c.moveTo(0, 0).lineTo(position.data.heading.x - position.data.x, position.data.heading.y - position.data.y)
            c.stroke()
          } else {
            c.clear()
          }
        },
        zIndex: 5,
        setContainer: async () => new Graphics()
      })

      const debugBounds = DebugBounds(renderable)

      const debugPosition = Renderable({
        zIndex: 5,
        setContainer: async () => pixiGraphics().circle(0, 0, 2).stroke({ color: 0x00ff00 })
      })

      const debugEntity = Entity<Position | Renderable>({
        id: `${entity.id}-renderable-debug`,
        components: {
          position: Position({ follows: entity.id, offset: { x: 0, y: 0 } }),
          renderable: Renderable({
            zIndex: 4,
            interpolate: true,
            setChildren: async () => [textBox, debugBounds, lineToHeading, debugPosition]
          })
        }
      })

      debugEntitiesPerEntity[entity.id].push(debugEntity)
      world.addEntity(debugEntity)
      debugRenderables.push(textBox, debugBounds, lineToHeading)
    }

    const drawFpsText = () => {
      const fpsText = FpsText()

      world.addEntities([fpsText])

      debugEntitiesPerEntity["fpsText"] = [fpsText]
    }

    const drawAllColliders = () => {

      const r = Renderable({
        onTick: ({ container }) => {
          const g = container as Graphics
          g.clear().setStrokeStyle({ width: 1, color: 0xffff00 })
          const { vertices } = world.physics?.debugRender() ?? { vertices: [] }

          for (let i = 0; i < vertices.length; i += 4) {
            const one = world.flip({ x: vertices[i], y: vertices[i + 1] })
            const two = world.flip({ x: vertices[i + 2], y: vertices[i + 3] })
            g.moveTo(one.x, one.y)
            g.lineTo(two.x, two.y)
          }
          g.stroke()
        },
        zIndex: 5,
        setContainer: async () => new Graphics()
      })

      const debugEntity = Entity<Position | Renderable>({
        id: `collider-debug`,
        components: {
          position: Position(),
          renderable: r
        }
      })

      world.addEntity(debugEntity)
      debugRenderables.push(r)
      debugEntitiesPerEntity["collider-debug"] = [debugEntity]
    }

    const debugText = (p: Position) => {
      return `x:${p.data.x.toFixed(0)} y:${p.data.y.toFixed(0)} z:${p.data.z.toFixed(0)} | vx:${p.data.velocity.x.toFixed(0)} vy:${p.data.velocity.y.toFixed(0)}`
    }

    return {
      id: "DebugSystem",
      query: ["debug", "position"],
      priority: 5,
      skipOnRollback: true,
      onTick: (entities: Entity<Position>[]) => {
        if (world.debug) {

          // handle new entities
          entities.forEach((entity) => {
            const { renderable } = entity.components

            if (!debugEntitiesPerEntity[entity.id] || !debugEntitiesPerEntity[entity.id].length) {
              debugEntitiesPerEntity[entity.id] = []
              if (renderable?.visible) addDebug(entity as Entity<Renderable | Position>)
            }
          })

          // draw all colliders
          if (!world.entity("collider-debug")) drawAllColliders()

          // draw the fps text
          if (!world.entity("fpsText")) drawFpsText()

          // clean up old entities
          for (const id in debugEntitiesPerEntity) {
            if (!world.entity(id)) rmDebug(id)
          }
        } else {

          // remove all debug entities
          values(debugEntitiesPerEntity).forEach((debugEntities) => {
            debugEntities.forEach((debugEntity) => world.removeEntity(debugEntity.id))
          })
          debugEntitiesPerEntity = {}

          // clear debug renderables
          debugRenderables = []
        }
      }
    }
  }
})
