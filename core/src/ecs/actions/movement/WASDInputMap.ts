import { Client, Entity, InputMap, InvokedAction, Position, XY, normalize } from "@piggo-gg/core"

export const WASDInputMap: Partial<InputMap> = {
  press: {
    "a,d": () => null, "w,s": () => null,
    "w,a": ({ entity, client }) => move(entity, client, -1, -2),
    "w,d": ({ entity, client }) => move(entity, client, 1, -2),
    "s,a": ({ entity, client }) => move(entity, client, -1, 2),
    "s,d": ({ entity, client }) => move(entity, client, 1, 2),
    "w": ({ entity, client }) => move(entity, client, 0, -1),
    "a": ({ entity, client }) => move(entity, client, -1, 0),
    "d": ({ entity, client }) => move(entity, client, 1, 0),
    "s": ({ entity, client }) => move(entity, client, 0, 1)
  }
}

const move = (entity: Entity, client: Client, x: number, y: number): null | InvokedAction<"move", XY> => {
  if (!entity.components.position) return null

  return { actionId: "move", playerId: client.playerId(), params: normalize({ x, y, entity: entity as Entity<Position> }) }
}
