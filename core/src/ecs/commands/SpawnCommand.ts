import { Ball, Command, Entity, InvokedAction, Piggo, Rock, Spaceship, Tree, Zomi, genHash, keys } from "@piggo-gg/core"

type SpawnCommandParams = { entity: string, id: string }
type SpawnCommandAction = InvokedAction<"spawn", SpawnCommandParams>

const entityBuilders: Record<string, (_?: { id: string }) => Entity> = {
  // "ball": Ball,
  // "spaceship": Spaceship,
  "zombie": Zomi,
  "zomi": Zomi,
  "piggo": Piggo,
  "tree": Tree,
  "rock": Rock
}

export const SpawnCommand: Command<SpawnCommandParams> = {
  id: "spawn",
  regex: /\/spawn (\w+)/,
  prepare: () => ({ actionId: "spawn" }),
  parse: ({ match, world }): SpawnCommandAction | undefined => {
    let response: SpawnCommandAction | undefined = undefined

    keys(entityBuilders).forEach((id) => {
      if (id === match[1]) response = {
        actionId: "spawn",
        playerId: world.client?.playerId(),
        params: { entity: id, id: `${match[1]}-${genHash()}` }
      }
    })
    return response
  },
  invoke: ({ params, world }) => {
    keys(entityBuilders).forEach((id) => {
      if (id === params.entity) {
        world.addEntity(entityBuilders[id]({ id: params.id }))
      }
    })
  },
  cooldown: 0
}

export type RemoveCommandParams = { entityId: string }
export type RemoveCommandAction = InvokedAction<"rm", RemoveCommandParams>

export const RemoveCommand: Command<RemoveCommandParams> = {
  id: "rm",
  regex: /\/rm ([^\s]+)/,
  prepare: () => ({ actionId: "rm" }),
  parse: ({ match, world }): RemoveCommandAction | undefined => {
    return { actionId: "rm", playerId: world.client?.playerId(), params: { entityId: match[1] } }
  },
  invoke: ({ params, world }) => {
    world.removeEntity(params.entityId)
  },
  cooldown: 0
}
