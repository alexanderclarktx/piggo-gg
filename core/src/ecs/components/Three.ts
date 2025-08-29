import { ClientSystemBuilder, Component, D3Renderer, Entity, Position, World } from "@piggo-gg/core"
import { Object3D } from "three"

type init = (entity: Entity<Three | Position>, world: World, three: D3Renderer) => Promise<void>

export type Three = Component<"three", {}> & {
  initialized: boolean
  o: Object3D[]
  init: undefined | init
  onRender: undefined | ((entity: Entity<Three | Position>, world: World, delta: number) => void)
  cleanup: (world: World) => void
}

export type ThreeProps = {
  init?: init
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

    const rendered: Record<string, Object3D[]> = {}

    return {
      id: "ThreeSystem",
      priority: 11,
      query: ["position", "three"],
      onTick: (entities: Entity<Three | Position>[]) => {
        if (!world.three) return

        for (const entity of entities) {
          const { three } = entity.components

          if (three.init && !three.initialized) {
            if (rendered[entity.id]) {
              world.three?.scene.remove(...three.o)
              rendered[entity.id] = []
            }
            three.init(entity, world, world.three)
            three.initialized = true
            continue
          }

          if (!rendered[entity.id]) rendered[entity.id] = []

          for (const o of three.o) {
            if (!rendered[entity.id].includes(o)) {
              rendered[entity.id].push(o)
              world.three?.scene.add(o)
            }
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
