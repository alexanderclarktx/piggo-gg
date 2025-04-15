import {
  ClientSystemBuilder, Entity, pixiGraphics, Position,
  Renderable, Component, entries, highestBlock
} from "@piggo-gg/core"

export type Shadow = Component<"shadow"> & { size: number, yOffset: number }

export const Shadow = (size: number, yOffset: number = 0): Shadow => ({
  type: "shadow", size, yOffset
})

type Target = Entity<Position | Renderable | Shadow>

export const ShadowSystem = ClientSystemBuilder({
  id: "ShadowSystem",
  init: (world) => {

    const shadows: Record<string, Entity<Renderable>> = {}
    const targets: Record<string, Target> = {}

    return {
      id: "ShadowSystem",
      query: ["shadow", "position", "renderable"],
      priority: 5,
      onTick: (entities: Target[]) => {

        // clean up
        for (const [id, shadow] of entries(shadows)) {
          if (!entities.find(e => e.id === id)) {
            world.removeEntity(shadow.id)
            delete shadows[id]
            delete targets[id]
          }
        }

        for (const [id, target] of entries(targets)) {
          if (target.removed) {
            world.removeEntity(shadows[id].id)
            delete targets[id]
            delete shadows[id]
          }
        }

        // create shadows
        for (const target of entities) {
          if (!shadows[target.id]) {
            const { size, yOffset } = target.components.shadow
            const shadowEntity = ShadowEntity(target, size, yOffset)

            shadows[target.id] = shadowEntity
            targets[target.id] = target

            world.addEntity(shadowEntity)
          }
        }
      }
    }
  }
})

const ShadowEntity = (target: Target, size: number, yOffset: number) => Entity<Renderable>({
  id: `shadow-${target.id}`,
  components: {
    position: Position(),
    renderable: Renderable({
      zIndex: target.components.renderable.zIndex,
      interpolate: true,
      dynamic: ({ entity, world }) => {
        const { position, renderable } = entity.components
        if (!position || !renderable) return

        const { data, lastCollided } = target.components.position

        const highest = highestBlock(data, world)

        position.setPosition({ x: data.x, y: data.y - (0.1 * world.flipped()) + yOffset, z: highest })
        position.setVelocity({ ...data.velocity, z: 0 })
        position.lastCollided = lastCollided

        renderable.c.alpha = 0.25 - (data.z - highest) / 500
      },
      setup: async (renderable) => {
        renderable.c = pixiGraphics().ellipse(0, 1, size * 2, size).fill({ color: 0x000000, alpha: 1 })
        renderable.setBlur({ strength: 3 })
      }
    })
  }
})
