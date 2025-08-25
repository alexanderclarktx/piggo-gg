import { ClientSystemBuilder, Component, Entity, Position, World } from "@piggo-gg/core"
import { Object3D } from "three"

export type Three = Component<"three", {}> & {
  initialized: boolean
  o: Object3D
  init: undefined | ((entity: Entity<Three>, world: World) => Promise<void>)
  cleanup: () => void
}

export type ThreeProps = {
  init?: (entity: Entity<Three>, world: World) => Promise<void>
}

export const Three = (props: ThreeProps = {}): Three => {
  const three: Three = {
    type: "three",
    data: {},
    initialized: false,
    o: new Object3D(),
    init: props.init,
    cleanup: () => {

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
          const { three, position } = entity.components

          if (three.init && !three.initialized) {
            three.init(entity, world)
            three.initialized = true
            continue
          }

          // update position
          world.three?.scene.add
        }
      }
    }
  }
})
