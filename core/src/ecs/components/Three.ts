import { ClientSystemBuilder, Component, Entity, Position, World, XYZ } from "@piggo-gg/core"
import { Object3D } from "three"

export type Three = Component<"three", {}> & {
  initialized: boolean
  o: Object3D
  position: XYZ
  init: undefined | ((entity: Entity<Three | Position>, world: World) => Promise<void>)
  onRender: undefined | ((entity: Entity<Three | Position>, world: World, delta: number) => void)
}

export type ThreeProps = {
  position?: XYZ
  init?: (entity: Entity<Three | Position>, world: World) => Promise<void>
  onRender?: (entity: Entity<Three | Position>, world: World, delta: number) => void
}

export const Three = (props: ThreeProps = {}): Three => {
  const three: Three = {
    type: "three",
    data: {},
    initialized: false,
    o: new Object3D(),
    position: props.position ?? { x: 0, y: 0, z: 0 },
    init: props.init,
    onRender: props.onRender
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
          three.o?.position.set(
            position.data.x + three.position.x,
            position.data.z + three.position.z,
            position.data.y + three.position.y
          )
        }
      },
      onRender: (entities: Entity<Three | Position>[], delta) => {
        for (const entity of entities) {
          const { three, position } = entity.components

          const interpolated = position.interpolate(world, delta)

          three.o?.position.set(
            interpolated.x + three.position.x,
            interpolated.z + three.position.z,
            interpolated.y + three.position.y
          )

          three.onRender?.(entity, world, delta)
        }
      }
    }
  }
})
