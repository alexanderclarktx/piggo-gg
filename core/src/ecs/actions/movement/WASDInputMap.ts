import { Entity, InputMap, InvokedAction, Position, World, XY, normalize } from "@piggo-gg/core"

export const WASDInputMap: Partial<InputMap> = {
  press: {
    "a,d": () => null, "w,s": () => null,
    "w,a": ({ entity, world }) => move(entity, world, -1, -2),
    "w,d": ({ entity, world }) => move(entity, world, 1, -2),
    "s,a": ({ entity, world }) => move(entity, world, -1, 2),
    "s,d": ({ entity, world }) => move(entity, world, 1, 2),
    "w": ({ entity, world }) => move(entity, world, 0, -1),
    "a": ({ entity, world }) => move(entity, world, -1, 0),
    "d": ({ entity, world }) => move(entity, world, 1, 0),
    "s": ({ entity, world }) => move(entity, world, 0, 1)
  }
}

const move = (entity: Entity, world: World, x: number, y: number): null | InvokedAction<"move", XY> => {
  if (!entity.components.position) return null

  if (x > 0) entity.components.position.data.facing = 1
  if (x < 0) entity.components.position.data.facing = -1

  x *= world.flipped()
  y *= world.flipped()

  return { actionId: "move", playerId: world.client?.playerId(), params: normalize({ x, y, entity: entity as Entity<Position> }) }
}
