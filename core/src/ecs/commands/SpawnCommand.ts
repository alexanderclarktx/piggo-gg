import { Command, Entity, InvokedAction, Piggo, Rock, Tree, Zomi, randomHash, keys } from "@piggo-gg/core"

const entityBuilders: Record<string, (_?: { id: string }) => Entity> = {
  "zombie": Zomi,
  "zomi": Zomi,
  "piggo": Piggo,
  "tree": Tree,
  "rock": Rock
}

type SpawnCommandParams = { entity: string, id: string }

export const SpawnCommand: Command<SpawnCommandParams> = {
  id: "spawn",
  regex: /^\/spawn (\w+)/,
  prepare: () => ({ actionId: "spawn" }),
  parse: ({ match, world }): InvokedAction<"spawn", SpawnCommandParams> | undefined => {
    let response: InvokedAction<"spawn", SpawnCommandParams> | undefined = undefined

    keys(entityBuilders).forEach((id) => {
      if (id === match[1]) response = {
        actionId: "spawn",
        playerId: world.client?.playerId(),
        params: { entity: id, id: `${match[1]}-${randomHash()}` }
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

type RemoveCommandParams = { entityId: string }

export const RemoveCommand: Command<RemoveCommandParams> = {
  id: "rm",
  regex: /^\/rm ([^\s]+)/,
  prepare: () => ({ actionId: "rm" }),
  parse: ({ match, world }): InvokedAction<"rm", RemoveCommandParams> | undefined => {
    return { actionId: "rm", playerId: world.client?.playerId(), params: { entityId: match[1] } }
  },
  invoke: ({ params, world }) => {
    world.removeEntity(params.entityId)
  },
  cooldown: 0
}

export type PlsCommandParams = { prompt: string }

export const PlsCommand: Command<PlsCommandParams> = {
  id: "pls",
  regex: /^pls (.+)/,
  prepare: () => ({ actionId: "pls" }),
  parse: ({ match, world }): InvokedAction<"pls", PlsCommandParams> | undefined => {
    return { actionId: "pls", playerId: world.client?.playerId(), params: { prompt: match[1] } }
  },
  invoke: ({ params, world }) => {
    world.client?.aiPls(params.prompt, (response) => {
      if ("error" in response) {
        console.error(response.error)
      } else {
        response.response.forEach((command) => {
          world.messages.push(world.tick + 2, world.client?.playerId() ?? "", command)
        })
      }
    })
  },
  cooldown: 0
}
