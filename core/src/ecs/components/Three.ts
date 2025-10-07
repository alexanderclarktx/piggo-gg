import { Client, ClientSystemBuilder, Component, ThreeRenderer, Entity, Position, World } from "@piggo-gg/core"
import { Object3D } from "three"

type ThreeInit = (entity: Entity<Three | Position>, world: World, three: ThreeRenderer) => Promise<void>
type OnRenderProps = { entity: Entity<Three | Position>, world: World, client: Client, delta: number, three: ThreeRenderer }

export type Three = Component<"three", {}> & {
  initialized: boolean
  o: Object3D[]
  init: undefined | ThreeInit
  onRender: undefined | ((_: OnRenderProps) => void)
  cleanup: (world: World) => void
}

export type ThreeProps = {
  init?: ThreeInit
  onRender?: (_: OnRenderProps) => void
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
              console.log("ADDING OBJECT3D TO SCENE", entity.id)
            }
          }
        }
      },
      onRender: (entities: Entity<Three | Position>[], delta) => {
        for (const entity of entities) {
          const { three } = entity.components
          three.onRender?.({ entity, world, client: world.client!, delta, three: world.three! })
        }
      }
    }
  }
})
