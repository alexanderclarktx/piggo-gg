import {
  ClientSystemBuilder, Entity, pixiGraphics, Position, Renderable, Component
} from "@piggo-gg/core"

export type Shadow = Component<"shadow"> & { size: number, yOffset: number }

export const Shadow = (size: number, yOffset: number = 0): Shadow => ({
  type: "shadow", size, yOffset
})

type Target = Entity<Position | Renderable | Shadow>

export const ShadowSystem = ClientSystemBuilder({
  id: "ShadowSystem",
  init: (world) => {

    const table: Record<string, Entity<Renderable>> = {}

    return {
      id: "ShadowSystem",
      query: ["shadow", "position", "renderable"],
      priority: 5,
      onTick: (entities: Target[]) => {
        for (const target of entities) {
          if (!table[target.id]) {
            const { size, yOffset } = target.components.shadow
            const shadowEntity = ShadowEntity(target, size, yOffset)

            table[target.id] = shadowEntity
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
      zIndex: target.components.renderable.zIndex - 0.1,
      interpolate: true,
      dynamic: ({ entity }) => {
        const { position, renderable } = entity.components
        if (!position) return

        renderable.c.alpha = 0.4 - target.components.position.data.z / 300

        position.data.x = target.components.position.data.x
        position.data.y = target.components.position.data.y + yOffset

        position.lastCollided = target.components.position.lastCollided

        const { x, y } = target.components.position.data.velocity
        position.setVelocity({ x, y })
      },
      setContainer: async () => pixiGraphics()
        .ellipse(0, 1, size * 2, size)
        .fill({ color: 0x000000, alpha: 1 })
    })
  }
})
