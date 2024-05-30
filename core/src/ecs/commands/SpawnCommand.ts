import { Ball, Command, Entity, InvokedAction, Spaceship, Zombie } from "@piggo-gg/core";

type SpawnCommandParams = { entity: string }
type SpawnCommandAction = InvokedAction<"spawn", SpawnCommandParams>

const entityBuilders: Record<string, () => Entity> = {
  // "ball": Ball,
  "spaceship": Spaceship,
  "zombie": Zombie
}

export const SpawnCommand: Command<SpawnCommandParams> = {
  id: "spawn",
  regex: /\/spawn (\w+)/,
  parse: ({ match, world }): SpawnCommandAction | undefined => {
    let response: SpawnCommandAction | undefined = undefined;
    Object.keys(entityBuilders).forEach((id) => {
      if (id === match[1]) response = {
        action: "spawn", playerId: world.client?.playerId, params: { entity: id }
      }
    });
    return response;
  },
  invoke: ({ params, world }) => {
    Object.keys(entityBuilders).forEach((id) => {
      if (id === params.entity) {
        world.addEntity(entityBuilders[id]());
      }
    });
  }
}
