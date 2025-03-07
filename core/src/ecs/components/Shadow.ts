import {
  ClientSystemBuilder, Entity, pixiGraphics, Position, Renderable, Component
} from "@piggo-gg/core"

export type Shadow = Component<"shadow"> & { size: number }

export const Shadow = (size: number): Shadow => ({
  type: "shadow", size
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
            const shadowEntity = ShadowEntity(target, target.components.shadow.size)
            table[target.id] = shadowEntity
            world.addEntity(shadowEntity)
          }
        }
      }
    }
  }
})

const ShadowEntity = (target: Target, size: number = 5) => Entity<Renderable>({
  id: `shadow-${target.id}`,
  components: {
    position: Position(),
    renderable: Renderable({
      zIndex: target.components.renderable.zIndex - 0.1,
      interpolate: true,
      dynamic: ({ entity }) => {
        const { position } = entity.components
        if (!position) return

        position.data.x = target.components.position.data.x
        position.data.y = target.components.position.data.y

        position.lastCollided = target.components.position.lastCollided

        const { x, y } = target.components.position.data.velocity
        position.setVelocity({ x, y })
      },
      setContainer: async () => {
        const g = pixiGraphics()
        g.ellipse(0, 1, size * 2, size)
        g.fill({ color: 0x000000, alpha: 0.3 })
        return g
      }
    })
  }
})
