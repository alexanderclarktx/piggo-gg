import { ClientSystemBuilder, Component, Entity, Position, World } from "@piggo-gg/core"
import { AnimationMixer, Object3D } from "three"

export type Three = Component<"three", {}> & {
  initialized: boolean
  o: Object3D[]
  init: undefined | ((entity: Entity<Three | Position>, world: World) => Promise<void>)
  onRender: undefined | ((entity: Entity<Three | Position>, world: World, delta: number) => void)
  cleanup: (world: World) => void
}

export type ThreeProps = {
  init?: (entity: Entity<Three | Position>, world: World) => Promise<void>
  onRender?: (entity: Entity<Three | Position>, world: World, delta: number) => void
}

export const Three = (props: ThreeProps = {}): Three => {
  const three: Three = {
    type: "three",
    data: {},
    initialized: false,
    o: [],
    init: props.init,
    onRender: props.onRender,
    cleanup: (world) => {
      world.three?.scene.remove(...three.o)
    }
  }

  return three
}

export const ThreeSystem = ClientSystemBuilder<"ThreeSystem">({
  id: "ThreeSystem",
  init: (world) => {
    return {
      id: "ThreeSystem",
      priority: 11,
      query: ["position", "three"],
      onTick: (entities: Entity<Three | Position>[]) => {
        for (const entity of entities) {
          const { three } = entity.components

          if (three.init && !three.initialized) {
            three.init(entity, world)
            three.initialized = true
            continue
          }
        }
      },
      onRender: (entities: Entity<Three | Position>[], delta) => {
        for (const entity of entities) {
          const { three } = entity.components
          three.onRender?.(entity, world, delta)
        }
      }
    }
  }
})
